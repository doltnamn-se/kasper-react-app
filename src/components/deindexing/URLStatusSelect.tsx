import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type StatusStep = keyof typeof statusSteps;

export const statusSteps = {
  received: 0,
  case_started: 1,
  request_submitted: 2,
  removal_approved: 3,
} as const;

interface URLStatusSelectProps {
  currentStatus: StatusStep;
  onStatusChange: (status: StatusStep) => void;
  isLoading?: boolean;
}

export const URLStatusSelect = ({ 
  currentStatus, 
  onStatusChange,
  isLoading 
}: URLStatusSelectProps) => {
  const { language } = useLanguage();

  return (
    <Select
      value={currentStatus || 'received'}
      onValueChange={(value: StatusStep) => onStatusChange(value)}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="received">
          {language === 'sv' ? 'Mottagen' : 'Received'}
        </SelectItem>
        <SelectItem value="case_started">
          {language === 'sv' ? 'Ärende påbörjat' : 'Case started'}
        </SelectItem>
        <SelectItem value="request_submitted">
          {language === 'sv' ? 'Begäran inskickad' : 'Request submitted'}
        </SelectItem>
        <SelectItem value="removal_approved">
          {language === 'sv' ? 'Borttagning godkänd' : 'Removal approved'}
        </SelectItem>
      </SelectContent>
    </Select>
  );
};