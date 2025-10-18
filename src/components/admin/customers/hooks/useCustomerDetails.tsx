import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCustomerData } from "./useCustomerData";
import { useCustomerActions } from "./useCustomerActions";
import { toast } from "sonner";
import { useCustomerPresence } from "../useCustomerPresence";

export const useCustomerDetails = (customerId: string, onOpenChange: (open: boolean) => void) => {
  const { onlineUsers, lastSeen } = useCustomerPresence();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  
  const { data: customerData, isLoading, refetch: refetchData } = useCustomerData(customerId);

  const {
    isUpdating,
    isSendingEmail,
    isDeleting,
    isUpdatingSubscription,
    isTogglingBan,
    handleResendActivationEmail,
    handleDeleteUser,
    handleUpdateSubscriptionPlan,
    handleToggleUserBan
  } = useCustomerActions(customerId, () => onOpenChange(false));

  useEffect(() => {
    const checkSuperAdmin = async () => {
      const { data, error } = await supabase.rpc('is_super_admin');
      if (!error && data) {
        setIsSuperAdmin(data);
      }
    };
    checkSuperAdmin();
  }, []);
  
  // Fetch initial ban status when customer data loads
  useEffect(() => {
    const fetchBanStatus = async () => {
      if (!customerId) return;
      
      const { data, error } = await supabase.functions.invoke('get-user-ban-status', {
        body: { user_id: customerId }
      });
      
      if (!error && data?.success) {
        console.log('[DEBUG] Initial ban status fetched:', data.banned, 'banned_until:', data.banned_until);
        setIsBanned(data.banned);
      } else {
        console.error('[DEBUG] Error fetching ban status:', error);
      }
    };
    
    fetchBanStatus();
  }, [customerId]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied', {
      description: `${label} copied to clipboard`
    });
  };

  const handleSubscriptionUpdate = async (plan: string) => {
    if (!customerId) return;
    setIsRefreshing(true);
    try {
      const success = await handleUpdateSubscriptionPlan(plan);
      if (success) {
        // Immediately refetch data to update UI
        await refetchData();
        toast.success('Subscription updated', {
          description: 'Customer subscription has been updated'
        });
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    if (!customerId) return;
    setIsRefreshing(true);
    try {
      await refetchData();
      toast.success('Customer data refreshed');
    } catch (error) {
      console.error("Error refreshing customer data:", error);
      toast.error('Failed to refresh customer data');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleBanUser = async () => {
    console.log('[DEBUG] handleBanUser called, current isBanned state:', isBanned);
    const result = await handleToggleUserBan();
    console.log('[DEBUG] handleToggleUserBan result:', result);
    
    if (result && 'success' in result) {
      console.log('[DEBUG] Setting isBanned to:', result.banned);
      setIsBanned(result.banned);
      await refetchData();
    } else {
      console.log('[DEBUG] Result was falsy or missing success property:', result);
    }
  };

  const isOnline = onlineUsers.has(customerId);
  const userLastSeen = lastSeen[customerId] || null;
  const usedUrls = customerData?.urls?.length || 0;
  const totalUrlLimit = (customerData?.limits?.additional_urls || 0);

  return {
    isLoading,
    customerData,
    isOnline,
    userLastSeen,
    usedUrls,
    totalUrlLimit,
    isSuperAdmin,
    isBanned,
    isUpdating,
    isSendingEmail,
    isDeleting,
    isRefreshing,
    isUpdatingSubscription,
    isTogglingBan,
    handleCopy,
    handleResendActivationEmail,
    handleDeleteUser,
    handleBanUser,
    handleSubscriptionUpdate,
    refetchData: handleRefresh
  };
};
