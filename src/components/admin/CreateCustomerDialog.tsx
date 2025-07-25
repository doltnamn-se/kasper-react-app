
import { useState, ReactNode } from "react";
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
  
  const FormContent = () => (
    <div className="space-y-4 py-4">
      <CustomerFormFields
        email={formData.email}
        displayName={formData.displayName}
        subscriptionPlan={formData.subscriptionPlan}
        customerType={formData.customerType}
        hasAddressAlert={formData.hasAddressAlert}
        onEmailChange={(email) => setFormData(prev => ({ ...prev, email }))}
        onDisplayNameChange={(displayName) => setFormData(prev => ({ ...prev, displayName }))}
        onSubscriptionPlanChange={(subscriptionPlan) => setFormData(prev => ({ ...prev, subscriptionPlan }))}
        onCustomerTypeChange={(customerType) => setFormData(prev => ({ ...prev, customerType }))}
        onHasAddressAlertChange={(hasAddressAlert) => setFormData(prev => ({ ...prev, hasAddressAlert }))}
      />
    </div>
  );
  
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
        <DrawerContent className="bg-white dark:bg-[#161617]">
          <DrawerHeader>
            <DrawerTitle className="font-medium flex items-center gap-2">
              <UserRoundCheck className="h-5 w-5" />
              {t('create.customer')}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4">
            <FormContent />
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
        <FormContent />
        <FormActions />
      </DialogContent>
    </Dialog>
  );
};
