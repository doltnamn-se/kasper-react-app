import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const createSupabaseAdmin = () => {
  console.log("Initializing Supabase admin client");
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

export const createAuthUser = async (supabaseAdmin: any, email: string) => {
  console.log("Creating auth user for:", email);
  const tempPassword = Math.random().toString(36).slice(-8);
  
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
  });

  if (authError) {
    console.error("Error creating auth user:", authError);
    throw new Error(authError.message);
  }

  if (!authData.user) {
    console.error("No user data returned from auth creation");
    throw new Error("Failed to create user");
  }

  console.log("Auth user created successfully:", authData.user.id);
  return authData.user;
};