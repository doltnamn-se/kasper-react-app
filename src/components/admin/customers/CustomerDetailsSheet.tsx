
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CustomerWithProfile } from "@/types/customer";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSafeArea } from "@/hooks/useSafeArea";
import { CustomerDetailsLoading } from "./components/CustomerDetailsLoading";
import { CustomerDetailsContent } from "./components/CustomerDetailsContent";
import { useCustomerDetails } from "./hooks/useCustomerDetails";
import { DeleteUserDialog } from "./components/DeleteUserDialog";
import { useState, useEffect } from "react";

interface CustomerDetailsSheetProps {
  customer: CustomerWithProfile | null;
  onOpenChange: (open: boolean) => void;
}

export const CustomerDetailsSheet = ({ customer: initialCustomer, onOpenChange }: CustomerDetailsSheetProps) => {
  const isMobile = useIsMobile();
  const safeArea = useSafeArea();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Use empty ID if customer is null to prevent hook conditionally
  const customerId = initialCustomer?.id || "";
  
  const {
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
    refetchData
  } = useCustomerDetails(customerId, onOpenChange);

  // Use refreshed customer data if available, otherwise use initial customer
  const customer = customerData?.customer || initialCustomer;

  // Update isOpen when customer changes
  useEffect(() => {
    if (initialCustomer) {
      setIsOpen(true);
    }
  }, [initialCustomer]);

  // Handle close with animation delay
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsOpen(false);
      // Wait for exit animation to complete before unmounting
      setTimeout(() => {
        onOpenChange(false);
      }, 500);
    } else {
      setIsOpen(true);
    }
  };

  // Return null early but AFTER all hooks have been called
  if (!customer) return null;

  // Skip loading skeleton if we have initial customer data - show content immediately
  const showLoadingSkeleton = isLoading && !initialCustomer;

  if (showLoadingSkeleton) {
    return isMobile ? (
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <CustomerDetailsLoading isMobile={true} />
      </Drawer>
    ) : (
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <CustomerDetailsLoading isMobile={false} />
      </Sheet>
    );
  }

  const handleActivationEmail = () => {
    if (customer.profile?.email && customer.profile?.display_name) {
      handleResendActivationEmail(
        customer.profile.email,
        customer.profile.display_name
      );
    }
  };

  return isMobile ? (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerContent 
        className="px-0 max-h-[85vh] bg-[#FFFFFF] dark:bg-[#161617]"
        style={{ paddingBottom: safeArea.bottom > 0 ? `${safeArea.bottom + 16}px` : '16px' }}
      >
        <ScrollArea className="h-full max-h-[85vh] overflow-y-auto">
          <CustomerDetailsContent
            customer={customer}
            isOnline={isOnline}
            userLastSeen={userLastSeen}
            onCopy={handleCopy}
            usedUrls={usedUrls}
            totalUrlLimit={totalUrlLimit}
            isSuperAdmin={isSuperAdmin}
            isBanned={isBanned}
            isSendingEmail={isSendingEmail}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
            isUpdatingSubscription={isUpdatingSubscription}
            isTogglingBan={isTogglingBan}
            onSendActivationEmail={handleActivationEmail}
            onDeleteUser={handleDeleteUser}
            onUpdateSubscriptionPlan={handleSubscriptionUpdate}
            onBanUser={handleBanUser}
            onRefresh={refetchData}
            isRefreshing={isRefreshing}
          />
        </ScrollArea>
      </DrawerContent>
      
      <DeleteUserDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteUser}
        isDeleting={isDeleting}
      />
    </Drawer>
  ) : (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="sm:max-w-xl w-full p-0 overflow-hidden bg-[#FFFFFF] dark:bg-[#161617]" hideCloseButton={true}>
        <ScrollArea className="h-full">
          <CustomerDetailsContent
            customer={customer}
            isOnline={isOnline}
            userLastSeen={userLastSeen}
            onCopy={handleCopy}
            usedUrls={usedUrls}
            totalUrlLimit={totalUrlLimit}
            isSuperAdmin={isSuperAdmin}
            isBanned={isBanned}
            isSendingEmail={isSendingEmail}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
            isUpdatingSubscription={isUpdatingSubscription}
            isTogglingBan={isTogglingBan}
            onSendActivationEmail={handleActivationEmail}
            onDeleteUser={handleDeleteUser}
            onUpdateSubscriptionPlan={handleSubscriptionUpdate}
            onBanUser={handleBanUser}
            onRefresh={refetchData}
            isRefreshing={isRefreshing}
          />
        </ScrollArea>
      </SheetContent>
      
      <DeleteUserDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteUser}
        isDeleting={isDeleting}
      />
    </Sheet>
  );
};
