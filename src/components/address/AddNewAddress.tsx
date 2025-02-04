import { useLanguage } from "@/contexts/LanguageContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { HousePlus } from "lucide-react";
import { AddressForm } from "./AddressForm";

interface AddNewAddressProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => Promise<void>;
}

export const AddNewAddress = ({ isOpen, onOpenChange, onSuccess }: AddNewAddressProps) => {
  const { language } = useLanguage();

  return (
    <>
      <p className="text-[#000000A6] dark:text-[#FFFFFFA6] text-sm font-medium mb-4">
        {language === 'sv' 
          ? 'Du har inte angett din adress ännu'
          : 'You have not provided your address yet'
        }
      </p>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <Button className="w-full">
            <HousePlus className="mr-2 h-4 w-4" />
            {language === 'sv' ? 'Lägg till adress' : 'Add new address'}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader className="mb-6">
            <SheetTitle>
              {language === 'sv' ? 'Lägg till adress' : 'Add new address'}
            </SheetTitle>
          </SheetHeader>
          <AddressForm onSuccess={onSuccess} />
        </SheetContent>
      </Sheet>
    </>
  );
};