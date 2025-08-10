
export interface CustomerMember {
  id: string;
  customer_id: string;
  display_name: string;
  relationship?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}
