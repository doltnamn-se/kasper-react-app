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

export const CustomerDetailsSheet = ({ customer, onOpenChange }: CustomerDetailsSheetProps) => {
  const isMobile = useIsMobile();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Use empty ID if customer is null to prevent hook conditionally
  const customerId = customer?.id || "";
  
  const {
    isLoading,
    isOnline,
    userLastSeen,
    usedUrls,
    totalUrlLimit,
    isSuperAdmin,
    isUpdating,
    isSendingEmail,
    isDeleting,
    additionalUrls,
    setAdditionalUrls,
    handleCopy,
    handleUrlLimitsUpdate,
    handleResendActivationEmail,
    handleDeleteUser,
    customerData
  } = useCustomerDetails(customerId, onOpenChange);

  // Return null early but AFTER all hooks have been called
  if (!customer) return null;
  
  // Get the address directly from customerData and add explicit debug logging
  const address = customerData?.checklistProgress?.address || null;
  
  console.log("CustomerDetailsSheet: Customer ID =", customerId);
  console.log("CustomerDetailsSheet: Raw checklistProgress data =", customerData?.checklistProgress);
  console.log("CustomerDetailsSheet: Found address =", address);
  console.log("CustomerDetailsSheet: checklistProgress object type =", typeof customerData?.checklistProgress);
  console.log("CustomerDetailsSheet: Full customerData =", customerData);
  
  // Create a complete customer object with address included
  const customerWithAddress = {
    ...customer,
    address: address
  };

  if (isLoading) {
    return isMobile ? (
      <Drawer open={!!customer} onOpenChange={onOpenChange}>
        <DrawerContent className="px-0 pb-16 max-h-[85vh]">
          <CustomerDetailsLoading isMobile={true} />
        </DrawerContent>
      </Drawer>
    ) : (
      <Sheet open={!!customer} onOpenChange={onOpenChange}>
        <SheetContent className="p-0">
          <CustomerDetailsLoading isMobile={false} />
        </SheetContent>
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

  // Log the final customer object being passed to CustomerDetailsContent
  console.log("CustomerDetailsSheet: Final customer object =", customerWithAddress);

  return isMobile ? (
    <Drawer open={!!customer} onOpenChange={onOpenChange}>
      <DrawerContent className="px-0 pb-16 max-h-[85vh]">
        <ScrollArea className="h-full max-h-[85vh] overflow-y-auto">
          <CustomerDetailsContent
            customer={customerWithAddress}
            isOnline={isOnline}
            userLastSeen={userLastSeen}
            onCopy={handleCopy}
            usedUrls={usedUrls}
            totalUrlLimit={totalUrlLimit}
            isSuperAdmin={isSuperAdmin}
            isSendingEmail={isSendingEmail}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
            additionalUrls={additionalUrls}
            onSendActivationEmail={handleActivationEmail}
            onUpdateUrlLimits={handleUrlLimitsUpdate}
            onDeleteUser={handleDeleteUser}
            setAdditionalUrls={setAdditionalUrls}
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
      <SheetContent side="right" className="sm:max-w-xl w-full p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <CustomerDetailsContent
            customer={customerWithAddress}
            isOnline={isOnline}
            userLastSeen={userLastSeen}
            onCopy={handleCopy}
            usedUrls={usedUrls}
            totalUrlLimit={totalUrlLimit}
            isSuperAdmin={isSuperAdmin}
            isSendingEmail={isSendingEmail}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
            additionalUrls={additionalUrls}
            onSendActivationEmail={handleActivationEmail}
            onUpdateUrlLimits={handleUrlLimitsUpdate}
            onDeleteUser={handleDeleteUser}
            setAdditionalUrls={setAdditionalUrls}
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
