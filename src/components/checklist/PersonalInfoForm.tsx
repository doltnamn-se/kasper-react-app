import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface PersonalInfoFormData {
  address: string;
  personalNumber: string;
}

interface PersonalInfoFormProps {
  onComplete: () => Promise<void>;
}

export const PersonalInfoForm = ({ onComplete }: PersonalInfoFormProps) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<PersonalInfoFormData>();

  const onSubmit = async (data: PersonalInfoFormData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase
        .from('customer_checklist_progress')
        .update({
          address: data.address,
          personal_number: data.personalNumber
        })
        .eq('customer_id', session.user.id);

      if (error) throw error;

      toast({
        title: language === 'sv' ? 'Information sparad' : 'Information saved',
        description: language === 'sv' ? 
          'Din personliga information har sparats' : 
          'Your personal information has been saved'
      });

      setIsOpen(false);
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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="w-full xl:w-1/4 lg:w-1/2">
          {language === 'sv' ? 'Lägg till information' : 'Add information'}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {language === 'sv' ? 'Personlig information' : 'Personal information'}
          </SheetTitle>
          <SheetDescription>
            {language === 'sv' 
              ? 'Lägg till din adress och personnummer' 
              : 'Add your address and personal number'}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <Input
              {...register("address", { required: true })}
              placeholder={language === 'sv' ? 'Adress' : 'Address'}
              className={errors.address ? "border-red-500" : ""}
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">
                {language === 'sv' ? 'Adress krävs' : 'Address is required'}
              </p>
            )}
          </div>
          <div>
            <Input
              {...register("personalNumber", { required: true })}
              placeholder={language === 'sv' ? 'Personnummer' : 'Personal number'}
              className={errors.personalNumber ? "border-red-500" : ""}
            />
            {errors.personalNumber && (
              <p className="text-red-500 text-sm mt-1">
                {language === 'sv' ? 'Personnummer krävs' : 'Personal number is required'}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full">
            {language === 'sv' ? 'Spara' : 'Save'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};