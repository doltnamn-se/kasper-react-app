
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CustomerWithProfile } from "@/types/customer";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { CustomerDetailsLoading } from "./components/CustomerDetailsLoading";
import { CustomerDetailsContent } from "./components/CustomerDetailsContent";
import { useCustomerDetails } from "./hooks/useCustomerDetails";
import { DeleteUserDialog } from "./components/DeleteUserDialog";
import { useState } from "react";

interface CustomerDetailsSheetProps {
  customer: CustomerWithProfile | null;
  onOpenChange: (open: boolean) => void;
}

export const CustomerDetailsSheet = ({ customer: initialCustomer, onOpenChange }: CustomerDetailsSheetProps) => {
  const isMobile = useIsMobile();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
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

  // Return null early but AFTER all hooks have been called
  if (!customer) return null;

  if (isLoading) {
    return isMobile ? (
      <Drawer open={!!customer} onOpenChange={onOpenChange}>
        <CustomerDetailsLoading isMobile={true} />
      </Drawer>
    ) : (
      <Sheet open={!!customer} onOpenChange={onOpenChange}>
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
    <Drawer open={!!customer} onOpenChange={onOpenChange}>
      <DrawerContent className="px-0 pb-16 max-h-[85vh] bg-[#FFFFFF] dark:bg-[#161617]">
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
    <Sheet open={!!customer} onOpenChange={onOpenChange}>
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
