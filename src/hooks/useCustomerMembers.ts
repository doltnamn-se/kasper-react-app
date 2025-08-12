
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CustomerMember {
  id: string;
  display_name: string;
  relationship?: string | null;
  avatar_url?: string | null;
}

export const useCustomerMembers = () => {
  const [members, setMembers] = useState<CustomerMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchMembers = async () => {
      setIsLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (!userId) {
          setMembers([]);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("customer_members")
          .select("id, display_name, relationship, avatar_url")
          .eq("customer_id", userId)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching members:", error);
          if (isMounted) setMembers([]);
        } else if (isMounted) {
          setMembers(data || []);
        }
      } catch (e) {
        console.error("Unexpected error fetching members:", e);
        if (isMounted) setMembers([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchMembers();

    // Subscribe to realtime changes for members
    const channel = supabase
      .channel("customer-members")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "customer_members" },
        () => fetchMembers()
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { members, isLoading };
};
