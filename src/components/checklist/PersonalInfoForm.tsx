import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { AddressSection } from "./form-sections/AddressSection";
import { useNavigate } from "react-router-dom";
import { launchConfetti } from "@/utils/confetti";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface PersonalInfoFormData {
  streetAddress: string;
  postalCode: string;
  city: string;
}

interface PersonalInfoFormProps {
  onComplete: () => Promise<void>;
}

export const PersonalInfoForm = ({ onComplete }: PersonalInfoFormProps) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<PersonalInfoFormData>();

  const onSubmit = async (data: PersonalInfoFormData) => {
    try {
      console.log('Submitting personal info form data:', data);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      if (!data.streetAddress || !data.postalCode || !data.city) {
        return;
      }

      const updateData = {
        street_address: data.streetAddress,
        postal_code: data.postalCode,
        city: data.city,
        address: `${data.streetAddress}, ${data.postalCode} ${data.city}`,
        completed_at: new Date().toISOString()
      };

      // Update checklist progress
      const { error: progressError } = await supabase
        .from('customer_checklist_progress')
        .update(updateData)
        .eq('customer_id', session.user.id);

      if (progressError) throw progressError;

      // Update customer record to mark checklist as completed
      const { error: customerError } = await supabase
        .from('customers')
        .update({
          checklist_completed: true,
          checklist_step: 4
        })
        .eq('id', session.user.id);

      if (customerError) throw customerError;

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['checklist-progress'] });
      await queryClient.invalidateQueries({ queryKey: ['customer-data'] });

      console.log('Successfully updated customer and checklist progress');

      // Launch confetti for completion
      launchConfetti();

      // Call onComplete callback
      await onComplete();

      // Show success message
      toast.success(language === 'sv' ? 'Checklistan är klar!' : 'Checklist completed!');

      // Navigate to home page after a delay to allow confetti to be visible
      setTimeout(() => {
        console.log('Navigating to home page after checklist completion');
        navigate('/', { replace: true });
      }, 2000);

    } catch (error) {
      console.error('Error saving personal info:', error);
      toast.error(
        language === 'sv' 
          ? 'Ett fel uppstod när informationen skulle sparas' 
          : 'An error occurred while saving the information'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-full">
      <AddressSection register={register} errors={errors} />
      <Button type="submit" className="w-full">
        {language === 'sv' ? 'Spara' : 'Save'}
      </Button>
    </form>
  );
};