
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { CurrentAddress } from "./CurrentAddress";
import { AddressHistory } from "./AddressHistory";
import { AddNewAddress } from "./AddNewAddress";
import { useAddressData } from "./hooks/useAddressData";

export const AddressDisplay = ({ onAddressUpdate }: { onAddressUpdate: () => void }) => {
  const { language } = useLanguage();
  const { addressData, fetchAddress, handleDeleteAddress } = useAddressData();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchAddress();
  }, []);

  const handleAddressUpdate = async () => {
    console.log('Address updated, refetching...');
    await fetchAddress();
    setIsOpen(false);
    onAddressUpdate();
  };

  // Check if there's a current active address - only check if the required fields exist
  const hasCurrentAddress = addressData && 
    addressData.street_address && 
    addressData.postal_code && 
    addressData.city;

  console.log('Address display state:', {
    addressData,
    hasCurrentAddress,
    conditions: {
      hasData: Boolean(addressData),
      hasStreet: Boolean(addressData?.street_address),
      hasPostal: Boolean(addressData?.postal_code),
      hasCity: Boolean(addressData?.city),
      streetValue: addressData?.street_address,
      postalValue: addressData?.postal_code,
      cityValue: addressData?.city
    }
  });

  return (
    <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
      <h2 className="text-[18px] font-semibold mb-6 text-[#000000] dark:text-[#FFFFFF]">
        {language === 'sv' ? 'Din adress' : 'Your Address'}
      </h2>
      
      {!hasCurrentAddress && (
        <AddNewAddress 
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          onSuccess={handleAddressUpdate}
        />
      )}

      {hasCurrentAddress && addressData && (
        <CurrentAddress 
          addressData={{
            street_address: addressData.street_address!,
            postal_code: addressData.postal_code!,
            city: addressData.city!,
            created_at: addressData.created_at
          }}
          onDelete={handleDeleteAddress}
        />
      )}

      {addressData?.address_history && addressData.address_history.length > 0 && (
        <AddressHistory history={addressData.address_history} />
      )}
    </div>
  );
};
