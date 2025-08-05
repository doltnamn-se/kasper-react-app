import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { AddressSection } from "./form-sections/AddressSection";
import { useNavigate } from "react-router-dom";
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
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
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
      
      // Show completion flow
      setShowCompletion(true);
      
      console.log('Starting completion flow - step 1: fading out individual elements');
      
      // Fade out individual elements (1 second) while keeping main container visible
      const elements = [
        '.max-w-\\[1400px\\] > div > div:first-child', // Header with AuthLogo
        'h1', // Main title
        '.py-6', // ChecklistSteps container
        '.Card', // Main checklist card
        '.fixed.bottom-6.left-6', // Language switch
        '.fixed.bottom-6.right-6' // Theme toggle
      ];
      
      elements.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
          element.classList.add('opacity-0', 'transition-opacity', 'duration-1000');
        }
      });
      
      // Show welcome message after fade out (1 second)
      setTimeout(() => {
        console.log('Starting completion flow - step 2: showing welcome message');
        setShowWelcome(true);
      }, 1000);
      
      // Invalidate queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['checklist-progress'] }),
        queryClient.invalidateQueries({ queryKey: ['customer-data'] }),
        queryClient.invalidateQueries({ queryKey: ['checklist-status'] })
      ]);

      // Hide welcome message and navigate after 3 seconds total (1s fade + 1s display + 1s fade)
      setTimeout(async () => {
        console.log('Starting completion flow - step 3: hiding welcome and navigating');
        setShowWelcome(false);
        
        // Call onComplete callback
        await onComplete();
        
        // Force a hard navigation to ensure fresh state
        window.location.href = '/';
      }, 3000);

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
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-full">
        <AddressSection register={register} errors={errors} />
        <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
          {language === 'sv' ? 'Spara' : 'Save'}
        </Button>
      </form>
      
      {/* Completion Flow */}
      {showWelcome && (
        <div className="welcome-message fixed inset-0 z-[9999] flex items-center justify-center bg-background animate-fade-in">
          <div className="text-center">
            <h1 className="text-2xl md:text-[2.5rem] font-domaine font-normal tracking-[0px] text-[#000000] dark:text-white">
              {t('checklist.completion.welcome')}
            </h1>
          </div>
        </div>
      )}
    </>
  );
};