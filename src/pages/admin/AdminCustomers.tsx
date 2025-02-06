
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { CustomerWithProfile } from "@/types/customer";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { CustomerDetails } from "@/components/admin/CustomerDetails";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { toast } from "sonner";

const AdminCustomers = () => {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<CustomerWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          profile: profiles (
            id,
            display_name,
            email,
            avatar_url,
            role,
            created_at,
            updated_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customers:', error);
        toast.error("Failed to load customers");
        return;
      }

      setCustomers(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white mb-6">
        {t('nav.admin.customers')}
      </h1>

      <AdminHeader onCustomerCreated={fetchCustomers} />

      <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        ) : customers.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300 text-center py-8">
            No customers found.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {customer.profile?.display_name || 'No name'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {customer.profile?.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      customer.onboarding_completed 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                    }`}>
                      {customer.onboarding_completed ? 'Completed' : 'In Progress'}
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">
                    {customer.customer_type}
                  </TableCell>
                  <TableCell>
                    {customer.subscription_plan 
                      ? customer.subscription_plan.replace('_', ' ') 
                      : 'No plan'}
                  </TableCell>
                  <TableCell>
                    {customer.created_at 
                      ? format(new Date(customer.created_at), 'MMM d, yyyy')
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <CustomerDetails customer={customer} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;
