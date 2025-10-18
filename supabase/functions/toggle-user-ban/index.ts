
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.13'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the request body
    const { user_id } = await req.json()
    
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing user_id parameter' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    console.log('[EDGE] Received request for user_id:', user_id)
    
    // Create Supabase client with admin privileges using service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Get the current user data to check if they're already banned
    const { data: userData, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(user_id)
    
    console.log('[EDGE] getUserById result:', { userData, getUserError })
    
    if (getUserError) {
      console.error('[EDGE] Error fetching user:', getUserError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    // Check if user is currently banned by checking banned_until field
    const bannedUntil = (userData?.user as any)?.banned_until
    const isBanned = bannedUntil != null && bannedUntil !== 'none'
    
    console.log('[EDGE] isBanned check:', { 
      isBanned, 
      banned_until: bannedUntil,
      user: userData?.user ? 'exists' : 'null'
    })
    
    let result
    
    if (isBanned) {
      console.log('[EDGE] User is banned, unbanning...')
      // If banned, unban the user by setting banned_until to "none"
      result = await supabaseAdmin.auth.admin.updateUserById(
        user_id,
        { ban_duration: 'none' }
      )
    } else {
      console.log('[EDGE] User is not banned, banning...')
      // If not banned, ban the user for ~100 years (876000 hours = ~100 years)
      result = await supabaseAdmin.auth.admin.updateUserById(
        user_id,
        { ban_duration: '876000h' }
      )
    }
    
    console.log('[EDGE] Update result:', { result })
    
    if (result.error) {
      console.error('[EDGE] Error toggling ban status:', result.error)
      return new Response(
        JSON.stringify({ error: 'Failed to update user ban status' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    console.log('[EDGE] Returning success, banned:', !isBanned)
    
    // Return success with the new ban state
    return new Response(
      JSON.stringify({ 
        success: true,
        banned: !isBanned
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
