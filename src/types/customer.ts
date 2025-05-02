
import { Database } from "@/integrations/supabase/types";

export type Profile = {
  id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  address: string | null;
  role: "super_admin" | "customer";
  created_at: string;
  updated_at: string;
  mrkoll_removal_checked_at: string | null;
};

export type Customer = Database['public']['Tables']['customers']['Row'];

export type CustomerWithProfile = Customer & {
  profile: Profile | null;
};
