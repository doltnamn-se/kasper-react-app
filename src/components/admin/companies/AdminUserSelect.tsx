import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdminUserSelectProps {
  companyId: string;
  currentAdminId: string | null;
  onAdminChanged: () => void;
}

interface CompanyCustomer {
  id: string;
  profile: {
    display_name: string | null;
    email: string | null;
  } | null;
}

export const AdminUserSelect = ({ 
  companyId, 
  currentAdminId, 
  onAdminChanged 
}: AdminUserSelectProps) => {
  const { language } = useLanguage();
  const [customers, setCustomers] = useState<CompanyCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompanyCustomers();
  }, [companyId]);

  const fetchCompanyCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          id,
          profile:profiles(display_name, email)
        `)
        .eq('company_id', companyId);

      if (error) throw error;

      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching company customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminChange = async (userId: string) => {
    try {
      const newAdminId = userId === 'none' ? null : userId;
      
      const { error } = await supabase
        .from('companies')
        .update({ admin_user_id: newAdminId })
        .eq('id', companyId);

      if (error) throw error;

      toast.success(
        language === 'sv' 
          ? 'Företagsadmin uppdaterad' 
          : 'Company admin updated'
      );
      onAdminChanged();
    } catch (error) {
      console.error('Error updating admin:', error);
      toast.error(
        language === 'sv' 
          ? 'Kunde inte uppdatera admin' 
          : 'Failed to update admin'
      );
    }
  };

  if (isLoading) {
    return <div className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6]">
      {language === 'sv' ? 'Laddar...' : 'Loading...'}
    </div>;
  }

  if (customers.length === 0) {
    return <div className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6]">
      {language === 'sv' ? 'Inga användare' : 'No users'}
    </div>;
  }

  return (
    <Select
      value={currentAdminId || 'none'}
      onValueChange={handleAdminChange}
    >
      <SelectTrigger className="w-[200px] h-8 text-xs">
        <SelectValue placeholder={language === 'sv' ? 'Välj admin' : 'Select admin'} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">
          {language === 'sv' ? 'Ingen admin' : 'No admin'}
        </SelectItem>
        {customers.map((customer) => (
          <SelectItem key={customer.id} value={customer.id}>
            {customer.profile?.display_name || customer.profile?.email || customer.id}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
