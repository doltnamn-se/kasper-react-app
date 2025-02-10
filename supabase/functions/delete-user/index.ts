
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create admin client for user operations
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Get user ID from request
    const { user_id } = await req.json()
    
    if (!user_id) {
      throw new Error('User ID is required')
    }

    // Get the requesting user's session
    const authHeader = req.headers.get('Authorization')!

    // Create client with auth context
    const adminClient = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )

    // Check if user is super admin
    const { data: isAdmin, error: adminCheckError } = await adminClient.rpc('is_super_admin')
    
    if (adminCheckError || !isAdmin) {
      throw new Error('Not authorized to delete users')
    }

    // First verify the user exists
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(user_id)
    
    if (userError || !user) {
      console.error('User not found error:', userError)
      throw new Error('User not found')
    }

    // Delete the user
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user_id)
    
    if (deleteError) {
      console.error('Delete user error:', deleteError)
      throw deleteError
    }

    return new Response(
      JSON.stringify({ message: 'User deleted successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Delete user function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
