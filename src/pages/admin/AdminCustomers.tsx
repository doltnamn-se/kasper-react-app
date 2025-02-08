
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
import { Badge } from "@/components/ui/badge";

const AdminCustomers = () => {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<CustomerWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [lastSeen, setLastSeen] = useState<Record<string, string>>({});

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

      // Filter out entries with no profile data or duplicate profiles
      const uniqueCustomers = data?.reduce((acc: CustomerWithProfile[], current) => {
        if (current.profile && !acc.some(item => item.profile?.id === current.profile?.id)) {
          acc.push(current);
        }
        return acc;
      }, []) || [];

      setCustomers(uniqueCustomers);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();

    const setupPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        try {
          // First, update or insert the user's presence record with proper conflict handling
          const { error: presenceError } = await supabase
            .from('user_presence')
            .upsert({ 
              user_id: user.id,
              last_seen: new Date().toISOString(),
              status: 'online'
            }, {
              onConflict: 'user_id',
              ignoreDuplicates: false
            });

          if (presenceError) {
            console.error('Error updating presence:', presenceError);
          }

          // Subscribe to presence changes
          const channel = supabase.channel('online-users');
          
          await channel
            .on('presence', { event: 'sync' }, () => {
              const state = channel.presenceState();
              console.log('Presence state:', state);
              
              // Get current online users from the presence state
              const newOnlineUsers = new Set<string>();
              const newLastSeen: Record<string, string> = {};

              Object.values(state).flat().forEach((presence: any) => {
                if (presence.user_id) {
                  newOnlineUsers.add(presence.user_id);
                  newLastSeen[presence.user_id] = presence.last_seen;
                }
              });

              setOnlineUsers(newOnlineUsers);
              setLastSeen(newLastSeen);
            })
            .subscribe(async (status) => {
              if (status === 'SUBSCRIBED') {
                const trackStatus = await channel.track({
                  user_id: user.id,
                  last_seen: new Date().toISOString(),
                });
                console.log('Track status:', trackStatus);
              }
            });

          // Set up an interval to update the last_seen timestamp
          const interval = setInterval(async () => {
            const { error: updateError } = await supabase
              .from('user_presence')
              .upsert({ 
                user_id: user.id,
                last_seen: new Date().toISOString(),
                status: 'online'
              }, {
                onConflict: 'user_id',
                ignoreDuplicates: false
              });

            if (updateError) {
              console.error('Error updating last_seen:', updateError);
            }
          }, 30000); // Update every 30 seconds

          return () => {
            clearInterval(interval);
            channel.unsubscribe();
          };
        } catch (error) {
          console.error('Error setting up presence:', error);
        }
      }
    };

    const cleanup = setupPresence();
    return () => {
      cleanup.then(cleanupFn => cleanupFn && cleanupFn());
    };
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
                <TableHead>Online Status</TableHead>
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
                    <Badge variant={customer.checklist_completed ? "default" : "secondary"}>
                      {customer.checklist_completed ? 'Completed' : 'In Progress'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={onlineUsers.has(customer.profile?.id || '') ? "default" : "secondary"}>
                      {onlineUsers.has(customer.profile?.id || '') ? 'Online' : 'Offline'}
                    </Badge>
                    {!onlineUsers.has(customer.profile?.id || '') && lastSeen[customer.profile?.id || ''] && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Last seen: {format(new Date(lastSeen[customer.profile?.id || '']), 'MMM d, HH:mm')}
                      </div>
                    )}
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
