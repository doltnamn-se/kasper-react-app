import { Database } from "@/integrations/supabase/types";

export type Profile = {
  id: string;
  email?: string | null;
  display_name?: string | null;
  role?: string | null;
  created_at: string;
  updated_at: string;
  first_name?: string | null;
  last_name?: string | null;
};

export type Customer = Database['public']['Tables']['customers']['Row'];

export type CustomerWithProfile = Customer & {
  profile: Profile | null;
};