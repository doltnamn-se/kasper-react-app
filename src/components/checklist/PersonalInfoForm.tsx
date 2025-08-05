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
      
      // Fade out everything on screen (1 second)
      const checklistPage = document.querySelector('.checklist-page');
      if (checklistPage) {
        checklistPage.classList.add('opacity-0', 'transition-opacity', 'duration-1000');
      }
      
      // Show welcome message after fade out (1 second)
      setTimeout(() => {
        setShowWelcome(true);
      }, 1000);
      
      // Invalidate queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['checklist-progress'] }),
        queryClient.invalidateQueries({ queryKey: ['customer-data'] }),
        queryClient.invalidateQueries({ queryKey: ['checklist-status'] })
      ]);

      // Hide welcome message after 1 second display and complete (1 second fade out)
      setTimeout(async () => {
        // Add fade out class to welcome message
        const welcomeDiv = document.querySelector('.welcome-message');
        if (welcomeDiv) {
          welcomeDiv.classList.add('animate-fade-out');
        }
        
        // Wait for fade out animation (1 second)
        setTimeout(async () => {
          setShowWelcome(false);
          
          // Call onComplete callback
          await onComplete();
          
          // Force a hard navigation to ensure fresh state
          window.location.href = '/';
        }, 1000);
      }, 1000);

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
      {showCompletion && (
        <>
          {/* Finalizing text */}
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4 animate-fade-in">
                {t('checklist.completion.finalizing')}
              </h1>
            </div>
          </div>
          
          {/* Welcome message */}
          {showWelcome && (
            <div className="welcome-message fixed inset-0 z-50 flex items-center justify-center bg-background animate-fade-in">
              <div className="text-center">
                <h1 className="text-2xl md:text-[2.5rem] font-domaine font-normal tracking-[0px] text-[#000000] dark:text-white">
                  {t('checklist.completion.welcome')}
                </h1>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};