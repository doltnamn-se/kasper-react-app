
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
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Get user ID from request
    const { user_id } = await req.json()
    
    if (!user_id) {
      throw new Error('User ID is required')
    }

    // Get the requesting user's session
    const authHeader = req.headers.get('Authorization')!
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

    // Delete the user
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user_id)
    
    if (deleteError) {
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
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
