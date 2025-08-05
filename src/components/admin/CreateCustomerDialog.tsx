
import { useState, ReactNode, useCallback, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { CustomerFormFields } from "./CustomerFormFields";
import { useCustomerCreation } from "@/hooks/useCustomerCreation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/contexts/LanguageContext";
import { UserRoundCheck, SendHorizontal } from "lucide-react";

interface CreateCustomerDialogProps {
  onCustomerCreated: () => void;
  children: ReactNode;
}

export const CreateCustomerDialog = ({ onCustomerCreated, children }: CreateCustomerDialogProps) => {
  const [open, setOpen] = useState(false);
  const { formData, setFormData, isCreating, handleCreateCustomer } = useCustomerCreation(() => {
    onCustomerCreated();
    setOpen(false);
  });
  const isMobile = useIsMobile();
  const { t } = useLanguage();

  const isFormValid = formData.email && formData.displayName;
  
  // Memoize onChange handlers to prevent unnecessary re-renders
  const handleEmailChange = useCallback((email: string) => {
    setFormData(prev => ({ ...prev, email }));
  }, [setFormData]);

  const handleDisplayNameChange = useCallback((displayName: string) => {
    setFormData(prev => ({ ...prev, displayName }));
  }, [setFormData]);

  const handleSubscriptionPlanChange = useCallback((subscriptionPlan: any) => {
    setFormData(prev => ({ ...prev, subscriptionPlan }));
  }, [setFormData]);

  const handleCustomerTypeChange = useCallback((customerType: any) => {
    setFormData(prev => ({ ...prev, customerType }));
  }, [setFormData]);

  const handleAddressAlertChange = useCallback((hasAddressAlert: boolean) => {
    setFormData(prev => ({ ...prev, hasAddressAlert }));
  }, [setFormData]);
  
  // Memoize FormContent to prevent unnecessary re-renders
  const FormContent = useMemo(() => (
    <div className="space-y-4 py-4">
      <CustomerFormFields
        email={formData.email}
        displayName={formData.displayName}
        subscriptionPlan={formData.subscriptionPlan}
        customerType={formData.customerType}
        hasAddressAlert={formData.hasAddressAlert}
        onEmailChange={handleEmailChange}
        onDisplayNameChange={handleDisplayNameChange}
        onSubscriptionPlanChange={handleSubscriptionPlanChange}
        onCustomerTypeChange={handleCustomerTypeChange}
        onHasAddressAlertChange={handleAddressAlertChange}
      />
    </div>
  ), [formData, handleEmailChange, handleDisplayNameChange, handleSubscriptionPlanChange, handleCustomerTypeChange, handleAddressAlertChange]);
  
  const FormActions = () => (
    <div className="flex flex-col gap-2">
      <Button 
        className="w-full" 
        onClick={() => handleCreateCustomer(true)}
        disabled={isCreating || !isFormValid}
      >
        {isCreating ? t('creating') : t('create.with.email')}
        <SendHorizontal className="h-4 w-4 ml-1" />
      </Button>
      <Button 
        className="w-full" 
        variant="outline"
        onClick={() => handleCreateCustomer(false)}
        disabled={isCreating || !isFormValid}
      >
        {isCreating ? t('creating') : t('create.without.email')}
      </Button>
    </div>
  );
  
  // Use Drawer for mobile
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {children}
        </DrawerTrigger>
        <DrawerContent className="bg-white dark:bg-[#161617] z-[10000]">
          <DrawerHeader>
            <DrawerTitle className="font-medium flex items-center gap-2">
              <UserRoundCheck className="h-5 w-5" />
              {t('create.customer')}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4">
            {FormContent}
          </div>
          <DrawerFooter>
            <FormActions />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
  
  // Use Dialog for desktop/tablet
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-[#161617]">
        <DialogHeader>
          <DialogTitle className="font-medium flex items-center gap-2">
            <UserRoundCheck className="h-5 w-5" />
            {t('create.customer')}
          </DialogTitle>
        </DialogHeader>
        {FormContent}
        <FormActions />
      </DialogContent>
    </Dialog>
  );
};
