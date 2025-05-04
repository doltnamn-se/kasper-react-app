
import { useState, FormEvent, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, CornerDownLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { t, language } = useLanguage();

  // Ensure we're working with a valid array even if customers is undefined
  const safeCustomers = Array.isArray(customers) ? customers : [];

  // Filter customers based on search query
  const filteredCustomers = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) return safeCustomers;
    
    return safeCustomers.filter((customer) => {
      const displayName = customer.profile?.display_name || '';
      const email = customer.profile?.email || '';
      const searchLower = searchQuery.toLowerCase();
      
      return displayName.toLowerCase().includes(searchLower) || 
             email.toLowerCase().includes(searchLower);
    });
  }, [safeCustomers, searchQuery]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !selectedCustomerId) return;
    
    await onAddUrl(url.trim(), selectedCustomerId);
    setUrl("");
  };

  const placeholderText = language === 'sv' ? 'Ange länk' : 'Enter link';
  const buttonText = language === 'sv' ? 'Lägg till' : 'Add';
  const selectCustomerText = language === 'sv' ? 'Välj kund' : 'Select customer';
  const searchCustomerText = language === 'sv' ? 'Sök kund...' : 'Search customer...';
  const noResultsText = language === 'sv' ? 'Inga resultat' : 'No results';

  const getCustomerDisplayText = (customer: { profile: { display_name: string | null; email: string | null; } | null }) => {
    return customer.profile?.display_name || customer.profile?.email || t('no.name');
  };

  const selectedCustomer = safeCustomers.find(customer => customer.id === selectedCustomerId);
  const selectedCustomerText = selectedCustomer 
    ? getCustomerDisplayText(selectedCustomer)
    : selectCustomerText;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="justify-between bg-[#f5f5f5] dark:bg-[#121212] w-full text-left font-normal"
            >
              {selectedCustomerText}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput 
                placeholder={searchCustomerText} 
                value={searchQuery}
                onValueChange={(value) => setSearchQuery(value)}
                className="h-9"
              />
              <CommandEmpty>{noResultsText}</CommandEmpty>
              {filteredCustomers && filteredCustomers.length > 0 && (
                <CommandGroup className="max-h-64 overflow-y-auto">
                  {filteredCustomers.map((customer) => (
                    <CommandItem
                      key={customer.id}
                      value={customer.id}
                      onSelect={(value) => {
                        setSelectedCustomerId(value);
                        setSearchQuery("");
                        setOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      {getCustomerDisplayText(customer)}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </Command>
          </PopoverContent>
        </Popover>
        
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
