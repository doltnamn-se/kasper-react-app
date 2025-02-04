import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { launchConfetti } from "@/utils/confetti";

interface AddressFormData {
  streetAddress: string;
  postalCode: string;
  city: string;
}

export const useAddressSubmit = (onSuccess?: () => Promise<void>) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSubmit = async (data: AddressFormData) => {
    try {
      console.log('Submitting address form data:', data);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Update address in customer_checklist_progress
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

      if (progressError) throw progressError;

      // Update checklist completion status in customers table
      const { error: customerError } = await supabase
        .from('customers')
        .update({
          checklist_completed: true,
          checklist_step: 4
        })
        .eq('id', session.user.id);

      if (customerError) throw customerError;

      // Invalidate queries to trigger UI updates
      await queryClient.invalidateQueries({ queryKey: ['checklist-progress'] });
      await queryClient.invalidateQueries({ queryKey: ['customer-data'] });

      // Show success toast
      toast({
        title: language === 'sv' ? 'Adress sparad' : 'Address saved',
        description: language === 'sv' ? 
          'Din adress har sparats och kommer att övervakas' : 
          'Your address has been saved and will be monitored'
      });

      // Launch confetti immediately after successful save
      launchConfetti();

      // Call onSuccess callback if provided
      if (onSuccess) {
        console.log('Calling onSuccess callback after saving address');
        await onSuccess();
      }

      // Navigate to home page after a short delay to allow confetti to be visible
      setTimeout(() => {
        console.log('Navigating to home page after address save');
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: language === 'sv' ? 'Ett fel uppstod' : 'An error occurred',
        description: language === 'sv' ? 
          'Det gick inte att spara adressen' : 
          'Could not save the address',
        variant: "destructive"
      });
    }
  };

  return { handleSubmit };
};