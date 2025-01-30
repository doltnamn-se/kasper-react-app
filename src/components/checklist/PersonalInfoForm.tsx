import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { AddressSection } from "./form-sections/AddressSection";
import { PersonalNumberSection } from "./form-sections/PersonalNumberSection";

interface PersonalInfoFormData {
  streetAddress?: string;
  postalCode?: string;
  city?: string;
  personalNumber?: string;
}

interface PersonalInfoFormProps {
  onComplete: () => Promise<void>;
}

export const PersonalInfoForm = ({ onComplete }: PersonalInfoFormProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<PersonalInfoFormData>();

  const onSubmit = async (data: PersonalInfoFormData) => {
    try {
      console.log('Submitting personal info form data:', data);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const hasAddress = data.streetAddress && data.postalCode && data.city;
      const hasPersonalNumber = data.personalNumber;

      if (!hasAddress && !hasPersonalNumber) {
        toast({
          title: language === 'sv' ? 'Validering misslyckades' : 'Validation failed',
          description: language === 'sv' 
            ? 'Du måste fylla i antingen adress eller personnummer' 
            : 'You must fill in either address or personal number',
          variant: "destructive"
        });
        return;
      }

      const updateData: any = {};
      
      if (hasAddress) {
        updateData.street_address = data.streetAddress;
        updateData.postal_code = data.postalCode;
        updateData.city = data.city;
        updateData.address = `${data.streetAddress}, ${data.postalCode} ${data.city}`;
      }

      if (hasPersonalNumber) {
        updateData.personal_number = data.personalNumber;
      }

      const { error } = await supabase
        .from('customer_checklist_progress')
        .update({
          ...updateData,
          completed_at: new Date().toISOString()
        })
        .eq('customer_id', session.user.id);

      if (error) throw error;

      toast({
        title: language === 'sv' ? 'Information sparad' : 'Information saved',
        description: language === 'sv' ? 
          'Din information har sparats' : 
          'Your information has been saved'
      });

      await onComplete();
    } catch (error) {
      console.error('Error saving personal info:', error);
      toast({
        title: language === 'sv' ? 'Ett fel uppstod' : 'An error occurred',
        description: language === 'sv' ? 
          'Det gick inte att spara informationen' : 
          'Could not save the information',
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-full">
      <AddressSection register={register} errors={errors} />

      <div className="relative w-full py-4">
        <div className="absolute inset-0 flex items-center px-6">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[#FFFFFF] dark:bg-[#1c1c1d] px-4 text-sm font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
            {language === 'sv' ? 'eller' : 'or'}
          </span>
        </div>
      </div>

      <PersonalNumberSection register={register} errors={errors} />

      <Button type="submit" className="w-full">
        {language === 'sv' ? 'Spara' : 'Save'}
      </Button>
    </form>
  );
};