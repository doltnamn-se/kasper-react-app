import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { AddressSection } from "./form-sections/AddressSection";
import { useNavigate } from "react-router-dom";
import { launchConfetti } from "@/utils/confetti";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<PersonalInfoFormData>();

  const onSubmit = async (data: PersonalInfoFormData) => {
    try {
      setIsSubmitting(true);
      console.log('Submitting personal info form data:', data);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

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

      // Update customer record
      const { error: customerError } = await supabase
        .from('customers')
        .update({
          checklist_completed: true,
          checklist_step: 4
        })
        .eq('id', session.user.id);

      if (customerError) throw customerError;

      console.log('Successfully updated customer and checklist progress');
      
      // Launch confetti
      launchConfetti();

      // Add fade-out animation to checklist page
      const checklistPage = document.querySelector('.checklist-page');
      if (checklistPage) {
        checklistPage.classList.add('opacity-0', 'transition-opacity', 'duration-500');
      }
      
      // Invalidate queries first
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['checklist-progress'] }),
        queryClient.invalidateQueries({ queryKey: ['customer-data'] }),
        queryClient.invalidateQueries({ queryKey: ['checklist-status'] })
      ]);

      // Wait for the animations and query invalidation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call onComplete callback
      await onComplete();

      // Force a hard navigation to ensure fresh state
      window.location.href = '/';

    } catch (error) {
      console.error('Error saving personal info:', error);
      setIsSubmitting(false);
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
      <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
        {language === 'sv' ? 'Lägg till adress' : 'Add address'}
      </Button>
    </form>
  );
};