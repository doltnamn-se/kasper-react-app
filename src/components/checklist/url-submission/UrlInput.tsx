import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface UrlInputProps {
  url: string;
  index: number;
  showRemove: boolean;
  onChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}

export const UrlInput = ({ url, index, showRemove, onChange, onRemove }: UrlInputProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex gap-2">
      <Input
        type="url"
        placeholder={t('url.input.placeholder')}
        value={url}
        onChange={(e) => onChange(index, e.target.value)}
        required
      />
      {showRemove && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onRemove(index)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};