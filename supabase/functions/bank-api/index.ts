
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Tink Credentials
const TINK_CLIENT_ID = Deno.env.get('TINK_CLIENT_ID') || "cdcc30e61ae9424e9de13c0286d9e11b";
const TINK_CLIENT_SECRET = Deno.env.get('TINK_CLIENT_SECRET') || "093c312025a544aa86ab5fc52c80faaf";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Auth Check
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error("Unauthorized");

    const body = await req.json();
    const route = body.route;
    let result;

    switch (route) {
        case 'institutions':
            // Need Client Access Token to list providers
            const clientToken = await getTinkClientToken('providers:read');
            const market = body.country || 'PT';
            const providersResp = await fetch(`https://api.tink.com/api/v1/providers/${market}`, {
                headers: { 'Authorization': `Bearer ${clientToken}` }
            });
            const providersData = await providersResp.json();
            
            // Map to internal format
            result = (providersData.providers || []).map((p: any) => ({
                id: p.name,
                name: p.displayName,
                logo: p.images?.icon || '',
                transaction_total_days: '90'
            }));
            break;

        case 'connect':
            // Generate Tink Link URL
            const redirectUrl = body.redirectUrl;
            const scope = 'accounts:read,transactions:read,user:read';
            const link = `https://link.tink.com/1.0/authorize/?client_id=${TINK_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUrl)}&scope=${scope}&market=PT`;
            
            result = { link, requisitionId: 'tink_flow' };
            break;

        case 'exchange_token':
            // Exchange Authorization Code for User Access Token
            const code = body.code;
            const params = new URLSearchParams();
            params.append('code', code);
            params.append('client_id', TINK_CLIENT_ID);
            params.append('client_secret', TINK_CLIENT_SECRET);
            params.append('grant_type', 'authorization_code');

            const tokenResp = await fetch('https://api.tink.com/api/v1/oauth/token', {
                method: 'POST',
                body: params
            });
            const tokenData = await tokenResp.json();
            
            if (tokenData.error) throw new Error(tokenData.error_description || "Token exchange failed");

            const accessToken = tokenData.access_token;

            // Fetch Accounts immediately to return ID list
            const accsResp = await fetch('https://api.tink.com/data/v2/accounts', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const accsData = await accsResp.json();

            result = { 
                accounts: accsData.accounts || [],
                accessToken: accessToken
            };
            break;

        case 'sync':
            // Fetch Balances & Transactions using stored Access Token
            const userToken = body.accessToken;
            if (!userToken) throw new Error("Access Token required for sync");

            // 1. Get Accounts (for balances)
            const accountsResp = await fetch('https://api.tink.com/data/v2/accounts', {
                headers: { 'Authorization': `Bearer ${userToken}` }
            });
            const accountsData = await accountsResp.json();

            // 2. Get Transactions
            const txResp = await fetch('https://api.tink.com/data/v2/transactions', {
                headers: { 'Authorization': `Bearer ${userToken}` }
            });
            const txData = await txResp.json();

            result = {
                accounts: accountsData.accounts,
                transactions: txData.transactions
            };
            break;

        default:
            throw new Error(`Unknown route: ${route}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

async function getTinkClientToken(scope: string) {
    const params = new URLSearchParams();
    params.append('client_id', TINK_CLIENT_ID);
    params.append('client_secret', TINK_CLIENT_SECRET);
    params.append('grant_type', 'client_credentials');
    params.append('scope', scope);

    const resp = await fetch('https://api.tink.com/api/v1/oauth/token', {
        method: 'POST',
        body: params
    });
    const data = await resp.json();
    if (data.error) throw new Error("Failed to get client token");
    return data.access_token;
}
