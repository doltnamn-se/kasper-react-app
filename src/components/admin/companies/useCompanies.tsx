import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Company {
  id: string;
  name: string;
  organization_number: string | null;
  contact_email: string | null;
  phone_number: string | null;
  billing_address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  admin_user_id: string | null;
  admin_user?: {
    display_name: string | null;
    email: string | null;
  };
}

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCompanies = async () => {
    try {
      const { data: companiesData, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching companies:', error);
        toast.error("Failed to load companies");
        return;
      }

      // Fetch admin user details for each company
      const companiesWithAdmins = await Promise.all(
        (companiesData || []).map(async (company) => {
          if (company.admin_user_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('display_name, email')
              .eq('id', company.admin_user_id)
              .maybeSingle();
            
            return {
              ...company,
              admin_user: profileData
            };
          }
          return { ...company, admin_user: null };
        })
      );

      setCompanies(companiesWithAdmins);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to load companies");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return { companies, isLoading, fetchCompanies };
};
