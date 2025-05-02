
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
  
  useEffect(() => {
    const checkBannedStatus = async () => {
      if (!customerId) return;
      
      try {
        const { data, error } = await supabase.auth.admin.getUserById(customerId);
        if (error) {
          console.error("Error getting user ban status:", error);
          return;
        }
        
        // Check if the user is banned
        setIsBanned(data?.user && data.user.banned_until !== null);
      } catch (err) {
        console.error("Error checking ban status:", err);
      }
    };
    
    if (customerId && isSuperAdmin) {
      checkBannedStatus();
    }
  }, [customerId, isSuperAdmin]);

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
    const result = await handleToggleUserBan();
    if (result && 'success' in result) {
      setIsBanned(result.banned);
      await refetchData();
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
