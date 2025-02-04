import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { UseFormRegister, FieldErrors } from "react-hook-form";

interface AddressFormData {
  streetAddress: string;
  postalCode: string;
  city: string;
}

interface AddressFormFieldsProps {
  register: UseFormRegister<AddressFormData>;
  errors: FieldErrors<AddressFormData>;
  isSubmitting: boolean;
}

export const AddressFormFields = ({ register, errors, isSubmitting }: AddressFormFieldsProps) => {
  const { language } = useLanguage();

  return (
    <>
      <div>
        <Input
          {...register("streetAddress", { required: true })}
          placeholder={language === 'sv' ? 'Gatuadress' : 'Street address'}
          className={errors.streetAddress ? "border-red-500" : ""}
          disabled={isSubmitting}
        />
        {errors.streetAddress && (
          <p className="text-red-500 text-sm mt-1">
            {language === 'sv' ? 'Gatuadress krävs' : 'Street address is required'}
          </p>
        )}
      </div>
      <div>
        <Input
          {...register("postalCode", { required: true })}
          placeholder={language === 'sv' ? 'Postnummer' : 'Postal code'}
          className={errors.postalCode ? "border-red-500" : ""}
          disabled={isSubmitting}
        />
        {errors.postalCode && (
          <p className="text-red-500 text-sm mt-1">
            {language === 'sv' ? 'Postnummer krävs' : 'Postal code is required'}
          </p>
        )}
      </div>
      <div>
        <Input
          {...register("city", { required: true })}
          placeholder={language === 'sv' ? 'Stad' : 'City'}
          className={errors.city ? "border-red-500" : ""}
          disabled={isSubmitting}
        />
        {errors.city && (
          <p className="text-red-500 text-sm mt-1">
            {language === 'sv' ? 'Stad krävs' : 'City is required'}
          </p>
        )}
      </div>
    </>
  );
};