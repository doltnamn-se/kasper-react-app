import { UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

interface AddressSectionProps {
  register: UseFormRegister<any>;
  errors: any;
}

export const AddressSection = ({ register, errors }: AddressSectionProps) => {
  const { language } = useLanguage();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#000000] dark:text-[#FFFFFF]">
        {language === 'sv' ? 'Adress' : 'Address'}
      </h3>
      <div>
        <Input
          {...register("streetAddress")}
          placeholder={language === 'sv' ? 'Gatuadress' : 'Street address'}
          className={errors.streetAddress ? "border-red-500" : ""}
        />
      </div>
      <div>
        <Input
          {...register("postalCode")}
          placeholder={language === 'sv' ? 'Postnummer' : 'Postal code'}
          className={errors.postalCode ? "border-red-500" : ""}
        />
      </div>
      <div>
        <Input
          {...register("city")}
          placeholder={language === 'sv' ? 'Stad' : 'City'}
          className={errors.city ? "border-red-500" : ""}
        />
      </div>
    </div>
  );
};