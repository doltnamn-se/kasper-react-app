import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";

interface CustomerTypeSelectProps {
  currentType: string;
  isUpdating: boolean;
  onUpdateType: (type: string) => void;
}

export const CustomerTypeSelect = ({
  currentType,
  isUpdating,
  onUpdateType
}: CustomerTypeSelectProps) => {
  const { language } = useLanguage();
  const [selectedType, setSelectedType] = useState<string>(currentType || 'private');

  // Update local state when props change (e.g., after refetch)
  useEffect(() => {
    setSelectedType(currentType || 'private');
  }, [currentType]);

  const handleTypeChange = (value: string) => {
    // Update local state immediately for visual feedback
    setSelectedType(value);
    // Trigger the update
    onUpdateType(value);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <Select value={selectedType} onValueChange={handleTypeChange} disabled={isUpdating}>
          <SelectTrigger className="w-[140px] h-8 text-xs font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="text-xs">
            <SelectItem value="private">
              {language === 'sv' ? 'Privatkund' : 'Private Customer'}
            </SelectItem>
            <SelectItem value="business">
              {language === 'sv' ? 'Företagskund' : 'Business Customer'}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
