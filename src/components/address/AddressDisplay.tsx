import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { HousePlus, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AddressForm } from "./AddressForm";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { sv, enUS } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

type AddressHistoryEntry = {
  street_address: string;
  postal_code: string;
  city: string;
  created_at: string;
  deleted_at: string;
}

interface AddressData {
  street_address: string | null;
  postal_code: string | null;
  city: string | null;
  created_at: string;
  deleted_at: string | null;
  address_history: AddressHistoryEntry[];
}

export const AddressDisplay = ({ onAddressUpdate }: { onAddressUpdate: () => void }) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchAddress = async () => {
    try {
      console.log('Fetching address data...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('customer_checklist_progress')
        .select('street_address, postal_code, city, created_at, deleted_at, address_history')
        .eq('customer_id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching address:', error);
        throw error;
      }
      
      console.log('Address data fetched:', data);
      if (data) {
        setAddressData(data as AddressData);
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

  const handleDeleteAddress = async () => {
    try {
      console.log('Deleting address...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      if (!addressData) return;

      const historyEntry: AddressHistoryEntry = {
        street_address: addressData.street_address!,
        postal_code: addressData.postal_code!,
        city: addressData.city!,
        created_at: addressData.created_at,
        deleted_at: new Date().toISOString(),
      };

      console.log('Creating history entry:', historyEntry);
      console.log('Current address_history:', addressData.address_history);

      const newHistory = addressData.address_history 
        ? [...addressData.address_history, historyEntry]
        : [historyEntry];

      console.log('New address_history:', newHistory);

      const { error } = await supabase
        .from('customer_checklist_progress')
        .update({
          street_address: null,
          postal_code: null,
          city: null,
          deleted_at: new Date().toISOString(),
          address_history: newHistory
        })
        .eq('customer_id', session.user.id);

      if (error) throw error;

      toast({
        title: language === 'sv' ? "Adress borttagen" : "Address deleted",
        description: language === 'sv' 
          ? "Din adress har tagits bort och sparats i historiken" 
          : "Your address has been deleted and saved in history",
      });

      fetchAddress();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: language === 'sv' ? "Ett fel uppstod" : "An error occurred",
        description: language === 'sv' 
          ? "Det gick inte att ta bort adressen" 
          : "Could not delete the address",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PP', { locale: language === 'sv' ? sv : enUS });
  };

  // Check if there's a current active address (not deleted)
  const hasCurrentAddress = addressData && addressData.street_address && !addressData.deleted_at;
  
  // Check if there's any address history
  const hasAddressHistory = addressData?.address_history && addressData.address_history.length > 0;

  console.log('Current address status:', {
    hasCurrentAddress,
    hasAddressHistory,
    addressData
  });

  return (
    <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-6 dark:text-white">
        {language === 'sv' ? 'Din adress' : 'Your Address'}
      </h2>
      
      {hasCurrentAddress ? (
        <div className="space-y-6">
          <div className="bg-[#f9fafb] dark:bg-[#232325] rounded-lg p-4 border border-[#e5e7eb] dark:border-[#2e2e30] relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              onClick={handleDeleteAddress}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <div className="space-y-2 mb-4">
              <p className="text-[#111827] dark:text-white text-base font-medium">
                {addressData?.street_address}
              </p>
              <p className="text-[#4b5563] dark:text-[#a1a1aa] text-sm">
                {addressData?.postal_code} {addressData?.city}
              </p>
            </div>
            <div className="pt-3 border-t border-[#e5e7eb] dark:border-[#2e2e30]">
              <p className="text-[#4b5563] dark:text-[#a1a1aa] text-sm">
                {language === 'sv' 
                  ? `Adresslarm aktivt sedan ${formatDate(addressData!.created_at)}`
                  : `Address alert active since ${formatDate(addressData!.created_at)}`
                }
              </p>
            </div>
          </div>

          {hasAddressHistory && (
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4 dark:text-white">
                {language === 'sv' ? 'Tidigare adresser' : 'Previous addresses'}
              </h3>
              <div className="space-y-4">
                {addressData?.address_history.map((historyEntry, index) => (
                  <div 
                    key={index}
                    className="bg-[#f9fafb] dark:bg-[#232325] rounded-lg p-4 border border-[#e5e7eb] dark:border-[#2e2e30] opacity-75"
                  >
                    <div className="space-y-2 mb-4">
                      <p className="text-[#111827] dark:text-white text-base font-medium">
                        {historyEntry.street_address}
                      </p>
                      <p className="text-[#4b5563] dark:text-[#a1a1aa] text-sm">
                        {historyEntry.postal_code} {historyEntry.city}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-[#e5e7eb] dark:border-[#2e2e30]">
                      <p className="text-[#4b5563] dark:text-[#a1a1aa] text-sm">
                        {language === 'sv'
                          ? `Aktiv ${formatDate(historyEntry.created_at)} - ${formatDate(historyEntry.deleted_at)}`
                          : `Active ${formatDate(historyEntry.created_at)} - ${formatDate(historyEntry.deleted_at)}`
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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