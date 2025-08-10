
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CustomerMember } from "@/types/customer-member";

export function useCustomerMembers(customerId: string) {
  const [members, setMembers] = useState<CustomerMember[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMembers = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("customer_members")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading members:", error);
      toast.error("Failed to load members");
    } else {
      setMembers(data || []);
    }
    setLoading(false);
  }, [customerId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const addMember = async (display_name: string, relationship?: string) => {
    if (!display_name?.trim()) {
      toast.error("Name is required");
      return false;
    }
    const { data, error } = await supabase
      .from("customer_members")
      .insert({ customer_id: customerId, display_name, relationship: relationship || null })
      .select("*")
      .single();

    if (error) {
      console.error("Error adding member:", error);
      toast.error(error.message.includes("Member limit")
        ? "Plan limit reached for members"
        : "Failed to add member");
      return false;
    }
    toast.success("Member added");
    setMembers((prev) => [...prev, data as CustomerMember]);
    return true;
  };

  const deleteMember = async (memberId: string) => {
    const { error } = await supabase
      .from("customer_members")
      .delete()
      .eq("id", memberId);

    if (error) {
      console.error("Error deleting member:", error);
      toast.error("Failed to delete member");
      return false;
    }
    toast.success("Member deleted");
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    return true;
  };

  return { members, loading, fetchMembers, addMember, deleteMember, setMembers };
}
