
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersRound } from "lucide-react";

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [totalCustomers, setTotalCustomers] = useState<number>(0);

  useEffect(() => {
    const fetchCustomerCount = async () => {
      try {
        const { count } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true });
        
        setTotalCustomers(count || 0);
      } catch (error) {
        console.error('Error fetching customer count:', error);
      }
    };

    fetchCustomerCount();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white mb-6">
        {t('nav.admin.dashboard')}
      </h1>

      <div className="grid gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('total.customers')}
            </CardTitle>
            <UsersRound className="h-4 w-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
          </CardContent>
        </Card>

        <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
          <p className="text-gray-600 dark:text-gray-300">
            Welcome to the admin dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

