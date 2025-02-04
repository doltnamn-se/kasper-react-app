import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { AddressFormFields } from "./AddressFormFields";
import { useAddressSubmit } from "./hooks/useAddressSubmit";

interface AddressFormData {
  streetAddress: string;
  postalCode: string;
  city: string;
}

interface AddressFormProps {
  onSuccess?: () => Promise<void>;
}

export const AddressForm = ({ onSuccess }: AddressFormProps) => {
  const { language } = useLanguage();
  const { handleSubmit: submitAddress } = useAddressSubmit(onSuccess);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AddressFormData>();

  return (
    <form onSubmit={handleSubmit(submitAddress)} className="space-y-4">
      <AddressFormFields
        register={register}
        errors={errors}
        isSubmitting={isSubmitting}
      />
      <div className="flex flex-col space-y-2">
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {language === 'sv' ? 'Spara' : 'Save'}
        </Button>
      </div>
    </form>
  );
};