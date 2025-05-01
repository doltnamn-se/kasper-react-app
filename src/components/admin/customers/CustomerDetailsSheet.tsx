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
  
  // Extract address from customerData and add it to customer object
  const formattedAddress = customerData?.checklistProgress?.formattedAddress || null;
  
  // Create a complete customer object with address included
  const customerWithAddress = {
    ...customer,
    address: formattedAddress
  };
  
  // Log the address assignment for debugging
  console.log("Customer data fetched:", customerData);
  console.log("Formatted address from data:", formattedAddress);
  console.log("Final customer with address:", customerWithAddress);

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
