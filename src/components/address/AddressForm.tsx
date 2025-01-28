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
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<AddressFormData>();

  const onSubmit = async (data: AddressFormData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase
        .from('customer_checklist_progress')
        .update({
          street_address: data.streetAddress,
          postal_code: data.postalCode,
          city: data.city,
          address: `${data.streetAddress}, ${data.postalCode} ${data.city}`
        })
        .eq('customer_id', session.user.id);

      if (error) throw error;

      toast({
        title: language === 'sv' ? 'Adress sparad' : 'Address saved',
        description: language === 'sv' ? 
          'Din adress har sparats och kommer att övervakas' : 
          'Your address has been saved and will be monitored'
      });

      setIsOpen(false);
      if (onSuccess) await onSuccess();
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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="w-full xl:w-1/4 lg:w-1/2">
          {language === 'sv' ? 'Lägg till adress' : 'Add address'}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {language === 'sv' ? 'Lägg till adress' : 'Add address'}
          </SheetTitle>
          <SheetDescription>
            {language === 'sv' 
              ? 'Lägg till din adress för att aktivera adressövervakning' 
              : 'Add your address to enable address monitoring'}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <Input
              {...register("streetAddress", { required: true })}
              placeholder={language === 'sv' ? 'Gatuadress' : 'Street address'}
              className={errors.streetAddress ? "border-red-500" : ""}
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
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">
                {language === 'sv' ? 'Stad krävs' : 'City is required'}
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