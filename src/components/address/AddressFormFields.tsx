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

  const formatPostalCode = (value: string) => {
    // Remove all non-digits and spaces
    const cleaned = value.replace(/[^\d\s]/g, '');
    // Remove extra spaces, only allow one space after the third digit
    const formatted = cleaned.replace(/\s/g, '').replace(/^(\d{3})(\d{2})$/, '$1 $2');
    return formatted;
  };

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
          {...register("postalCode", {
            required: true,
            pattern: {
              value: /^\d{3}\s?\d{2}$/,
              message: language === 'sv' ? 'Postnummer måste vara 5 siffror' : 'Postal code must be 5 digits'
            },
            onChange: (e) => {
              e.target.value = formatPostalCode(e.target.value);
            }
          })}
          placeholder={language === 'sv' ? 'Postnummer' : 'Postal code'}
          className={errors.postalCode ? "border-red-500" : ""}
          disabled={isSubmitting}
          maxLength={6} // 5 digits + 1 possible space
        />
        {errors.postalCode && (
          <p className="text-red-500 text-sm mt-1">
            {errors.postalCode.message || (language === 'sv' ? 'Postnummer krävs' : 'Postal code is required')}
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