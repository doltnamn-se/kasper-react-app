import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CustomerType } from "@/types/customer-form";

interface CustomerTypeFieldProps {
  value: CustomerType;
  onChange: (value: CustomerType) => void;
}

export const CustomerTypeField = ({ value, onChange }: CustomerTypeFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="customerType">Customer Type</Label>
      <Select
        value={value}
        onValueChange={onChange}
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
  );
};