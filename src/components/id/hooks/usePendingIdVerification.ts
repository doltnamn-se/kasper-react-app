import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";

export interface IdVerification {
  id: string;
  customer_id: string;
  status: string;
  document_path: string | null;
  created_at: string;
}

export function usePendingIdVerification() {
  const { userProfile } = useUserProfile();
  const [pending, setPending] = useState<IdVerification | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    if (!userProfile?.id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('id_verifications')
        .select('*')
        .eq('customer_id', userProfile.id)
        .eq('status', 'requested')
        .is('document_path', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      setPending(data as IdVerification | null);
    } catch (e: any) {
      console.error('Error fetching id_verifications:', e);
      setError(e?.message ?? 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, [userProfile?.id]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  return { pending, setPending, loading, error, refresh: fetchPending };
}
