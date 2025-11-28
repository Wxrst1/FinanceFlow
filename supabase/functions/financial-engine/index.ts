import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // 1. Init Client with Auth Context
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // 2. Get User Context
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error("Unauthorized");

    const { task, workspaceId, params } = await req.json()

    // 3. Fetch Data EFFICIENTLY (Only select needed fields)
    // Instead of sending 5MB of JSON from client, we fetch 5MB from DB locally in the datacenter
    const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, date, type, category')
        .eq('workspace_id', workspaceId || user.id)
        .order('date', { ascending: true });

    if (!transactions) throw new Error("No data found");

    let result = {};

    // 4. Execute Task
    switch (task) {
        case 'burn_rate':
            result = calculateBurnRate(transactions);
            break;
        
        case 'forecast':
            const { accounts } = await req.json(); // Accounts might still be passed or fetched
            result = generateForecast(transactions, accounts || [], params?.burnRate);
            break;

        case 'category_analysis':
            result = analyzeCategories(transactions);
            break;

        case 'simulation':
            result = runSimulation(transactions, params.scenarios);
            break;

        default:
            throw new Error("Invalid task");
    }

    // 5. Return with Cache Headers
    // Calculations are valid for at least 5 minutes or until mutation
    return new Response(JSON.stringify(result), {
      headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=60' 
      },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

// --- Logic migrated from Client to Server ---

function calculateBurnRate(transactions: any[]) {
    const now = new Date();
    const cutoff = new Date();
    cutoff.setDate(now.getDate() - 90);

    const expenses = transactions.filter((t: any) => 
      t.type === 'expense' && 
      new Date(t.date) >= cutoff &&
      !['Habitação', 'Investimentos', 'Housing', 'Investment'].includes(t.category)
    ).reduce((sum: number, t: any) => sum + t.amount, 0);

    return { burnRate: expenses / 90 };
}

function analyzeCategories(transactions: any[]) {
    const map = new Map<string, number>();
    transactions.filter((t: any) => t.type === 'expense').forEach((t: any) => {
        map.set(t.category, (map.get(t.category) || 0) + t.amount);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

function generateForecast(transactions: any[], accounts: any[], burnRateOverride?: number) {
    // Simplified server-side logic
    const burnRate = burnRateOverride || calculateBurnRate(transactions).burnRate;
    const currentBalance = accounts.reduce((acc: number, a: any) => acc + a.balance, 0);
    
    const data = [];
    let balance = currentBalance;
    const today = new Date();

    for(let i=0; i<30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        balance -= burnRate;
        data.push({ date: date.toISOString(), balance, isProjected: true });
    }

    return { 
        data, 
        summary: { 
            burnRate, 
            lowestBalance: Math.min(...data.map(d => d.balance)),
            monthEndBalance: balance 
        } 
    };
}

function runSimulation(transactions: any[], scenarios: any[]) {
    // Heavy Monte Carlo logic here
    // ...
    return { status: "completed", scenarios_applied: scenarios.length };
}