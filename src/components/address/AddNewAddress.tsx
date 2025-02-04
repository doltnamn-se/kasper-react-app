import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { HousePlus } from "lucide-react";
import { AddressForm } from "./AddressForm";
import { useState } from "react";

interface AddNewAddressProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => Promise<void>;
}

export const AddNewAddress = ({ isOpen, onOpenChange, onSuccess }: AddNewAddressProps) => {
  const { language } = useLanguage();
  const [showForm, setShowForm] = useState(false);

  const handleButtonClick = () => {
    setShowForm(true);
    onOpenChange(true);
  };

  return (
    <div className="space-y-4">
      <p className="text-[#000000A6] dark:text-[#FFFFFFA6] text-sm font-medium">
        {language === 'sv' 
          ? 'Du har inte angett din adress ännu'
          : 'You have not provided your address yet'
        }
      </p>
      
      {!showForm ? (
        <Button 
          className="w-full transition-all duration-300 ease-in-out"
          onClick={handleButtonClick}
        >
          <HousePlus className="mr-2 h-4 w-4" />
          {language === 'sv' ? 'Lägg till adress' : 'Add new address'}
        </Button>
      ) : (
        <div className="animate-fade-in">
          <AddressForm onSuccess={async () => {
            setShowForm(false);
            onOpenChange(false);
            await onSuccess();
          }} />
        </div>
      )}
    </div>
  );
};