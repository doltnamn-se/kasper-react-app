import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AddressAlertFieldProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export const AddressAlertField = ({ value, onChange }: AddressAlertFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="hasAddressAlert">Address Alert</Label>
      <Select
        value={value ? "yes" : "no"}
        onValueChange={(value) => onChange(value === "yes")}
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
  );
};