import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface ChecklistAddressFormData {
  streetAddress: string;
  postalCode: string;
  city: string;
}

interface ChecklistAddressFormProps {
  onSuccess?: () => Promise<void>;
}

export const ChecklistAddressForm = ({ onSuccess }: ChecklistAddressFormProps) => {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<ChecklistAddressFormData>();

  const onSubmit = async (data: ChecklistAddressFormData) => {
    try {
      console.log('Submitting checklist address form data:', data);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // First update the checklist progress
      const { error: progressError } = await supabase
        .from('customer_checklist_progress')
        .update({
          street_address: data.streetAddress,
          postal_code: data.postalCode,
          city: data.city,
          address: `${data.streetAddress}, ${data.postalCode} ${data.city}`,
          completed_at: new Date().toISOString()
        })
        .eq('customer_id', session.user.id);

      if (progressError) {
        console.error('Error updating checklist progress:', progressError);
        throw progressError;
      }

      // Then update the customer record - removed has_address_alert setting
      const { error: customerError } = await supabase
        .from('customers')
        .update({
          checklist_completed: true,
          checklist_step: 4 // Ensure we're on the final step
        })
        .eq('id', session.user.id);

      if (customerError) {
        console.error('Error updating customer:', customerError);
        throw customerError;
      }

      console.log('Successfully completed checklist');

      // Invalidate relevant queries to trigger UI updates
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['checklist-progress'] }),
        queryClient.invalidateQueries({ queryKey: ['customer-data'] })
      ]);

      if (onSuccess) {
        console.log('Calling onSuccess callback after completing checklist');
        await onSuccess();
      }
    } catch (error) {
      console.error('Error completing checklist:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...register("streetAddress", { required: true })}
          placeholder={language === 'sv' ? 'Gatuadress' : 'Street address'}
          className={`md:text-base ${errors.streetAddress ? "border-red-500" : ""}`}
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
          className={`md:text-base ${errors.postalCode ? "border-red-500" : ""}`}
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
          className={`md:text-base ${errors.city ? "border-red-500" : ""}`}
        />
        {errors.city && (
          <p className="text-red-500 text-sm mt-1">
            {language === 'sv' ? 'Stad krävs' : 'City is required'}
          </p>
        )}
      </div>
      <Button type="submit" className="w-full">
        {language === 'sv' ? 'Lägg till adress' : 'Add address'}
      </Button>
    </form>
  );
};