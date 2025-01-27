import { CustomerTypeField } from "./customer-form/CustomerTypeField";
import { AddressAlertField } from "./customer-form/AddressAlertField";
import { BasicInfoFields } from "./customer-form/BasicInfoFields";
import { CustomerFormFieldsProps } from "@/types/customer-form";

export const CustomerFormFields = ({
  email,
  displayName,
  subscriptionPlan,
  customerType,
  hasAddressAlert,
  onEmailChange,
  onDisplayNameChange,
  onSubscriptionPlanChange,
  onCustomerTypeChange,
  onHasAddressAlertChange,
}: CustomerFormFieldsProps) => {
  return (
    <div className="space-y-4">
      <CustomerTypeField 
        value={customerType}
        onChange={onCustomerTypeChange}
      />
      
      <AddressAlertField
        value={hasAddressAlert}
        onChange={onHasAddressAlertChange}
      />

      <BasicInfoFields
        email={email}
        displayName={displayName}
        subscriptionPlan={subscriptionPlan}
        onEmailChange={onEmailChange}
        onDisplayNameChange={onDisplayNameChange}
        onSubscriptionPlanChange={onSubscriptionPlanChange}
      />
    </div>
  );
};