
import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Loader2, CornerDownLeft, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const [open, setOpen] = useState(false);
  const { t, language } = useLanguage();
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const selectedLabel = selectedCustomer
    ? (selectedCustomer.profile?.display_name || selectedCustomer.profile?.email || t('no.name'))
    : "";

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedLabel || selectCustomerText}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="z-50 p-0 min-w-[240px] bg-background" align="start">
            <Command>
              <CommandInput placeholder={searchCustomerText} />
              <CommandEmpty>{language === 'sv' ? 'Ingen kund hittades.' : 'No customer found.'}</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  {customers.map((customer) => {
                    const label = customer.profile?.display_name || customer.profile?.email || t('no.name');
                    const searchable = `${label} ${customer.profile?.email ?? ''}`;
                    return (
                      <CommandItem
                        key={customer.id}
                        value={searchable}
                        onSelect={() => {
                          setSelectedCustomerId(customer.id);
                          setOpen(false);
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", selectedCustomerId === customer.id ? "opacity-100" : "opacity-0")} />
                        <span>{label}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
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
