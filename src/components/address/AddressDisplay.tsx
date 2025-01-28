import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { HousePlus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AddressForm } from "./AddressForm";

export const AddressDisplay = ({ onAddressUpdate }: { onAddressUpdate: () => void }) => {
  const { language } = useLanguage();

  return (
    <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-6 dark:text-white">
        {language === 'sv' ? 'Din adress' : 'Your Address'}
      </h2>
      <p className="text-[#000000A6] dark:text-[#FFFFFFA6] text-sm font-medium mb-4">
        {language === 'sv' 
          ? 'Du har inte angett din adress ännu'
          : 'You have not provided your address yet'
        }
      </p>
      <Sheet>
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
          <AddressForm onSuccess={onAddressUpdate} />
        </SheetContent>
      </Sheet>
    </div>
  );
};