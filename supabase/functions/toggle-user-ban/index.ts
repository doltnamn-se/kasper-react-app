
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { userId, ban } = await req.json();
    
    // Validate input
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get Supabase admin client using service role key (for accessing admin APIs)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Check if the requesting user is a super admin
    const authHeader = req.headers.get('Authorization')?.split(' ')[1];
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Not authorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed', details: authError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Check if user is super admin
    const { data: isSuperAdmin, error: adminCheckError } = await supabaseAdmin.rpc('is_super_admin', { user_id: user.id });
    if (adminCheckError || !isSuperAdmin) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Ban or unban the user
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: ban ? '87600h' : null, // 10 years if banning, null if unbanning
    });

    if (error) {
      console.error('Error updating user ban status:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update user ban status', details: error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Get the updated user to return their status
    const { data: updatedUser, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (fetchError) {
      console.error('Error fetching updated user:', fetchError);
      return new Response(
        JSON.stringify({ success: true, message: ban ? 'User banned successfully' : 'User unbanned successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        banned: !!updatedUser?.user.banned_until,
        message: ban ? 'User banned successfully' : 'User unbanned successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
