
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'Missing x-api-key header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Initialize Supabase (Admin to bypass RLS for API Key lookup, but use context later)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Validate Key
    const { data: keyData, error: keyError } = await supabaseAdmin
        .from('api_keys')
        .select('workspace_id, last_used_at')
        .eq('key', apiKey)
        .single();

    if (keyError || !keyData) {
        return new Response(JSON.stringify({ error: 'Invalid API Key' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const workspaceId = keyData.workspace_id;

    // Update usage stats (fire and forget)
    supabaseAdmin.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('key', apiKey).then();

    // Parse URL for Endpoint
    const url = new URL(req.url);
    const endpoint = url.pathname.split('/').pop(); // Get last segment e.g. /transactions -> transactions

    let result;

    switch (endpoint) {
        case 'transactions':
            const { data: txs } = await supabaseAdmin
                .from('transactions')
                .select('*')
                .eq('workspace_id', workspaceId)
                .order('date', { ascending: false })
                .limit(100);
            result = txs;
            break;

        case 'accounts':
            const { data: accs } = await supabaseAdmin
                .from('accounts')
                .select('*')
                .eq('workspace_id', workspaceId);
            result = accs;
            break;

        case 'budgets':
            const { data: budgets } = await supabaseAdmin
                .from('budgets')
                .select('*')
                .eq('workspace_id', workspaceId);
            result = budgets;
            break;

        case 'subscriptions':
            const { data: subs } = await supabaseAdmin
                .from('subscriptions')
                .select('*')
                .eq('workspace_id', workspaceId);
            result = subs;
            break;

        case 'networth':
            // Calculate Net Worth
            const { data: accounts } = await supabaseAdmin.from('accounts').select('balance').eq('workspace_id', workspaceId);
            const { data: assets } = await supabaseAdmin.from('assets').select('value, type').eq('workspace_id', workspaceId);
            const { data: investments } = await supabaseAdmin.from('investments').select('current_value').eq('workspace_id', workspaceId);

            const totalLiquid = accounts?.reduce((acc: number, a: any) => acc + (a.balance || 0), 0) || 0;
            const totalInvestments = investments?.reduce((acc: number, i: any) => acc + (i.current_value || 0), 0) || 0;
            
            let totalAssets = 0;
            let totalLiabilities = 0;

            assets?.forEach((a: any) => {
                if (a.type === 'liability') totalLiabilities += a.value;
                else totalAssets += a.value;
            });

            result = {
                liquid: totalLiquid,
                invested: totalInvestments,
                assets: totalAssets,
                liabilities: totalLiabilities,
                net_worth: (totalLiquid + totalAssets + totalInvestments) - totalLiabilities
            };
            break;

        default:
            return new Response(JSON.stringify({ error: 'Endpoint not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
