import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { HousePlus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AddressForm } from "./AddressForm";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { sv, enUS } from "date-fns/locale";

interface AddressData {
  street_address: string;
  postal_code: string;
  city: string;
  created_at: string;
}

export const AddressDisplay = ({ onAddressUpdate }: { onAddressUpdate: () => void }) => {
  const { language } = useLanguage();
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchAddress = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('customer_checklist_progress')
        .select('street_address, postal_code, city, created_at')
        .eq('customer_id', session.user.id)
        .single();

      if (error) throw error;
      if (data && data.street_address && data.postal_code && data.city) {
        setAddressData(data);
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  useEffect(() => {
    fetchAddress();
  }, []);

  const handleAddressUpdate = () => {
    fetchAddress();
    setIsOpen(false);
    onAddressUpdate();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PP', { locale: language === 'sv' ? sv : enUS });
  };

  return (
    <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-6 dark:text-white">
        {language === 'sv' ? 'Din adress' : 'Your Address'}
      </h2>
      
      {addressData ? (
        <div className="space-y-6">
          <div className="bg-[#f9fafb] dark:bg-[#232325] rounded-lg p-4 border border-[#e5e7eb] dark:border-[#2e2e30]">
            <div className="space-y-2 mb-4">
              <p className="text-[#111827] dark:text-white text-base font-medium">
                {addressData.street_address}
              </p>
              <p className="text-[#4b5563] dark:text-[#a1a1aa] text-sm">
                {addressData.postal_code} {addressData.city}
              </p>
            </div>
            <div className="pt-3 border-t border-[#e5e7eb] dark:border-[#2e2e30]">
              <p className="text-[#4b5563] dark:text-[#a1a1aa] text-sm">
                {language === 'sv' 
                  ? `Adresslarm aktivt sedan ${formatDate(addressData.created_at)}`
                  : `Address alert active since ${formatDate(addressData.created_at)}`
                }
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <p className="text-[#000000A6] dark:text-[#FFFFFFA6] text-sm font-medium mb-4">
            {language === 'sv' 
              ? 'Du har inte angett din adress ännu'
              : 'You have not provided your address yet'
            }
          </p>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button className="w-full">
                <HousePlus className="mr-2 h-4 w-4" />
                {language === 'sv' ? 'Lägg till adress' : 'Add new address'}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>
                  {language === 'sv' ? 'Lägg till adress' : 'Add new address'}
                </SheetTitle>
              </SheetHeader>
              <AddressForm onSuccess={handleAddressUpdate} />
            </SheetContent>
          </Sheet>
        </>
      )}
    </div>
  );
};