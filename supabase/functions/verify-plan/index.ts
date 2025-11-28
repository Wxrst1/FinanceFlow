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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error("Unauthorized");

    // Fetch Profile (Source of Truth)
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    const plan = profile?.plan || 'starter';
    const { feature } = await req.json();

    // Backend Logic for Capabilities
    const capabilities = {
      'starter': { can_add_member: false, max_accounts: 2, ai_access: false },
      'pro': { can_add_member: false, max_accounts: 99, ai_access: true },
      'business': { can_add_member: true, max_accounts: 999, ai_access: true }
    };

    const userCaps = capabilities[plan as keyof typeof capabilities];
    const allowed = userCaps ? userCaps[feature as keyof typeof userCaps] : false;

    return new Response(
      JSON.stringify({ 
        allowed, 
        plan, 
        reason: allowed ? 'Authorized' : `Upgrade to ${plan === 'starter' ? 'Pro' : 'Business'} required.` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})