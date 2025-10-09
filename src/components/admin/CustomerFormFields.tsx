import { CustomerTypeField } from "./customer-form/CustomerTypeField";
import { CompanySelectField } from "./customer-form/CompanySelectField";
import { AddressAlertField } from "./customer-form/AddressAlertField";
import { BasicInfoFields } from "./customer-form/BasicInfoFields";
import { CustomerFormFieldsProps } from "@/types/customer-form";

export const CustomerFormFields = ({
  email,
  displayName,
  subscriptionPlan,
  customerType,
  hasAddressAlert,
  companyId,
  onEmailChange,
  onDisplayNameChange,
  onSubscriptionPlanChange,
  onCustomerTypeChange,
  onHasAddressAlertChange,
  onCompanyIdChange,
}: CustomerFormFieldsProps) => {
  return (
    <div className="space-y-4">
      <BasicInfoFields
        email={email}
        displayName={displayName}
        subscriptionPlan={subscriptionPlan}
        onEmailChange={onEmailChange}
        onDisplayNameChange={onDisplayNameChange}
        onSubscriptionPlanChange={onSubscriptionPlanChange}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <CustomerTypeField 
          value={customerType}
          onChange={onCustomerTypeChange}
        />
        
        <AddressAlertField
          value={hasAddressAlert}
          onChange={onHasAddressAlertChange}
        />
      </div>
      
      {customerType === 'business' && (
        <CompanySelectField 
          value={companyId}
          onChange={onCompanyIdChange}
        />
      )}
    </div>
  );
};
