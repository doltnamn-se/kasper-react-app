
import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CornerDownLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AdminMonitoringUrlFormProps {
  customers: { id: string; profile: { display_name: string | null; email: string | null; } | null }[];
  onAddUrl: (url: string, customerId: string) => Promise<void>;
  isSubmitting: boolean;
}

export const AdminMonitoringUrlForm = ({
  customers,
  onAddUrl,
  isSubmitting
}: AdminMonitoringUrlFormProps) => {
  const [url, setUrl] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const { t, language } = useLanguage();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !selectedCustomerId) return;
    
    await onAddUrl(url.trim(), selectedCustomerId);
    setUrl("");
  };

  const placeholderText = language === 'sv' ? 'Ange länk' : 'Enter link';
  const buttonText = language === 'sv' ? 'Lägg till' : 'Add';
  const selectCustomerText = language === 'sv' ? 'Välj kund' : 'Select customer';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
          <SelectTrigger className="bg-[#f5f5f5] dark:bg-[#121212]">
            <SelectValue placeholder={selectCustomerText} />
          </SelectTrigger>
          <SelectContent>
            {customers.map(customer => (
              <SelectItem 
                key={customer.id} 
                value={customer.id}
                className="cursor-pointer"
              >
                {customer.profile?.display_name || customer.profile?.email || t('no.name')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex gap-2">
          <Input 
            type="url" 
            value={url} 
            onChange={e => setUrl(e.target.value)} 
            placeholder={placeholderText} 
            className="flex-1 bg-[#f5f5f5] dark:bg-[#121212]" 
            required 
          />
          <Button 
            type="submit" 
            disabled={isSubmitting || !selectedCustomerId} 
            className="bg-[#e0e0e0] text-[#000000] hover:bg-[#d0d0d0] dark:bg-[#2a2a2b] dark:text-white dark:hover:bg-[#3a3a3b]"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {buttonText}
                <CornerDownLeft className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};
