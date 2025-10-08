
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

type AddressHistoryEntry = {
  street_address: string;
  postal_code: string;
  city: string;
  created_at: string;
  deleted_at: string;
}

export type AddressData = {
  street_address: string | null;
  postal_code: string | null;
  city: string | null;
  address: string | null;
  created_at: string;
  deleted_at: string | null;
  address_history: AddressHistoryEntry[];
}

const fetchAddressData = async (): Promise<AddressData | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  console.log('Current session:', session);
  
  if (!session?.user?.id) {
    console.log('No user session found');
    return null;
  }

  console.log('Fetching address for user:', session.user.id);
  
  const { data, error } = await supabase
    .from('customer_checklist_progress')
    .select('street_address, postal_code, city, address, created_at, deleted_at, address_history')
    .eq('customer_id', session.user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching address:', error);
    throw error;
  }

  console.log('Raw data from database:', data);
  
  if (!data) {
    return null;
  }

  const typedData: AddressData = {
    street_address: data.street_address,
    postal_code: data.postal_code,
    city: data.city,
    address: data.address,
    created_at: data.created_at,
    deleted_at: data.deleted_at,
    address_history: Array.isArray(data.address_history) 
      ? data.address_history.map((entry: any) => ({
          street_address: entry.street_address,
          postal_code: entry.postal_code,
          city: entry.city,
          created_at: entry.created_at,
          deleted_at: entry.deleted_at
        }))
      : []
  };
  
  console.log('Processed address data:', typedData);
  return typedData;
};

export const useAddressData = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: addressData, refetch } = useQuery({
    queryKey: ['address-data'],
    queryFn: fetchAddressData,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  const fetchAddress = async () => {
    await refetch();
  };

  const handleDeleteAddress = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      if (!addressData) return;

      const historyEntry: AddressHistoryEntry = {
        street_address: addressData.street_address!,
        postal_code: addressData.postal_code!,
        city: addressData.city!,
        created_at: addressData.created_at,
        deleted_at: new Date().toISOString(),
      };

      const newHistory = addressData.address_history 
        ? [...addressData.address_history, historyEntry]
        : [historyEntry];

      const { error } = await supabase
        .from('customer_checklist_progress')
        .update({
          street_address: null,
          postal_code: null,
          city: null,
          address: null,
          deleted_at: new Date().toISOString(),
          address_history: newHistory
        })
        .eq('customer_id', session.user.id);

      if (error) throw error;

      toast({
        title: language === 'sv' ? "Adress borttagen" : "Address deleted",
        description: language === 'sv' 
          ? "Din adress har tagits bort och sparats i historiken" 
          : "Your address has been deleted and saved in history",
      });

      // Invalidate the query to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['address-data'] });
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: language === 'sv' ? "Ett fel uppstod" : "An error occurred",
        description: language === 'sv' 
          ? "Det gick inte att ta bort adressen" 
          : "Could not delete the address",
        variant: "destructive"
      });
    }
  };

  return {
    addressData,
    fetchAddress,
    handleDeleteAddress
  };
};
