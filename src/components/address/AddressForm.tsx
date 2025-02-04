import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import confetti from 'canvas-confetti';

interface AddressFormData {
  streetAddress: string;
  postalCode: string;
  city: string;
}

interface AddressFormProps {
  onSuccess?: () => Promise<void>;
}

export const AddressForm = ({ onSuccess }: AddressFormProps) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AddressFormData>();

  const launchConfetti = () => {
    console.log('Launching confetti celebration');
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        spread: 60,
        startVelocity: 30,
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const onSubmit = async (data: AddressFormData) => {
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
          checklist_completed: true
        })
        .eq('id', session.user.id);

      if (customerError) throw customerError;

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

      // Navigate to home page after a delay to allow confetti to be visible
      setTimeout(() => {
        console.log('Navigating to home page after address save');
        navigate('/');
      }, 3000);

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {language === 'sv' ? 'Slutför' : 'Finish'}
      </Button>
    </form>
  );
};