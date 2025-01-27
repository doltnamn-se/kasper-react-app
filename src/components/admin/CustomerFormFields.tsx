import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CustomerFormFieldsProps {
  email: string;
  displayName: string;
  subscriptionPlan: "1_month" | "6_months" | "12_months";
  customerType: "private" | "business";
  hasAddressAlert: boolean;
  onEmailChange: (value: string) => void;
  onDisplayNameChange: (value: string) => void;
  onSubscriptionPlanChange: (value: "1_month" | "6_months" | "12_months") => void;
  onCustomerTypeChange: (value: "private" | "business") => void;
  onHasAddressAlertChange: (value: boolean) => void;
}

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
      <div className="space-y-2">
        <Label htmlFor="customerType">Customer Type</Label>
        <Select
          value={customerType}
          onValueChange={onCustomerTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select customer type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="private">Private Customer</SelectItem>
            <SelectItem value="business">Business Client</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hasAddressAlert">Address Alert</Label>
        <Select
          value={hasAddressAlert ? "yes" : "no"}
          onValueChange={(value) => onHasAddressAlertChange(value === "yes")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select address alert status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="customer@example.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          placeholder="John Doe"
          value={displayName}
          onChange={(e) => onDisplayNameChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subscriptionPlan">Subscription Plan</Label>
        <Select
          value={subscriptionPlan}
          onValueChange={onSubscriptionPlanChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select subscription plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1_month">1 Month</SelectItem>
            <SelectItem value="6_months">6 Months</SelectItem>
            <SelectItem value="12_months">12 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};