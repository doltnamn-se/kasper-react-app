import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

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
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<PersonalInfoFormData>();

  const onSubmit = async (data: PersonalInfoFormData) => {
    try {
      console.log('Submitting personal info form data:', data);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Check if at least one option is filled
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {language === 'sv' ? 'Adress' : 'Address'}
        </h3>
        <div>
          <Input
            {...register("streetAddress")}
            placeholder={language === 'sv' ? 'Gatuadress' : 'Street address'}
            className={errors.streetAddress ? "border-red-500" : ""}
          />
        </div>
        <div>
          <Input
            {...register("postalCode")}
            placeholder={language === 'sv' ? 'Postnummer' : 'Postal code'}
            className={errors.postalCode ? "border-red-500" : ""}
          />
        </div>
        <div>
          <Input
            {...register("city")}
            placeholder={language === 'sv' ? 'Stad' : 'City'}
            className={errors.city ? "border-red-500" : ""}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 mx-0">
        <Separator className="flex-grow" />
        <span className="text-sm font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
          {language === 'sv' ? 'eller' : 'or'}
        </span>
        <Separator className="flex-grow" />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {language === 'sv' ? 'Personnummer' : 'Personal Number'}
        </h3>
        <div>
          <Input
            {...register("personalNumber", {
              pattern: {
                value: /^\d{6}-\d{4}$/,
                message: language === 'sv' 
                  ? 'Personnummer måste vara i formatet XXXXXX-XXXX' 
                  : 'Personal number must be in the format XXXXXX-XXXX'
              }
            })}
            placeholder={language === 'sv' ? 'XXXXXX-XXXX' : 'XXXXXX-XXXX'}
            className={errors.personalNumber ? "border-red-500" : ""}
          />
          {errors.personalNumber && (
            <p className="text-red-500 text-sm mt-1">
              {errors.personalNumber.message}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full">
        {language === 'sv' ? 'Spara' : 'Save'}
      </Button>
    </form>
  );
};