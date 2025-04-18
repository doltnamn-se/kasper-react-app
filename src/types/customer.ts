
import { Database } from "@/integrations/supabase/types";

export type Profile = {
  id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: "super_admin" | "customer";
  created_at: string;
  updated_at: string;
  web_device_type?: Database["public"]["Enums"]["web_device_type"] | null;
};

export type Customer = Database['public']['Tables']['customers']['Row'];

export type CustomerWithProfile = Customer & {
  profile: Profile | null;
};
