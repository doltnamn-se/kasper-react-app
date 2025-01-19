import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CustomerFormFieldsProps {
  email: string;
  displayName: string;
  subscriptionPlan: "1_month" | "6_months" | "12_months";
  onEmailChange: (value: string) => void;
  onDisplayNameChange: (value: string) => void;
  onSubscriptionPlanChange: (value: "1_month" | "6_months" | "12_months") => void;
}

export const CustomerFormFields = ({
  email,
  displayName,
  subscriptionPlan,
  onEmailChange,
  onDisplayNameChange,
  onSubscriptionPlanChange,
}: CustomerFormFieldsProps) => {
  return (
    <div className="space-y-4">
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