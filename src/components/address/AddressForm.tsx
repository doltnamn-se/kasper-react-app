import { useForm } from "react-hook-form";
import { useLanguage } from "@/contexts/LanguageContext";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SheetClose } from "@/components/ui/sheet";
import { AddressSearchInput } from "./AddressSearchInput";

interface AddressFormData {
  street_address: string;
  postal_code: string;
  city: string;
}

export const AddressForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { language } = useLanguage();
  const { toast } = useToast();

  const form = useForm<AddressFormData>({
    defaultValues: {
      street_address: '',
      postal_code: '',
      city: ''
    }
  });

  const onSubmit = async (data: AddressFormData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { error } = await supabase
        .from('customer_checklist_progress')
        .upsert({
          customer_id: session.user.id,
          street_address: data.street_address,
          postal_code: data.postal_code,
          city: data.city,
        });

      if (error) throw error;

      toast({
        title: language === 'sv' ? "Adress sparad" : "Address saved",
        description: language === 'sv' ? 
          "Din adress har sparats" : 
          "Your address has been saved",
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: language === 'sv' ? "Ett fel uppstod" : "An error occurred",
        description: language === 'sv' ? 
          "Det gick inte att spara adressen" : 
          "Could not save the address",
        variant: "destructive"
      });
    }
  };

  const handleAddressSelect = (address: { street: string; postalCode: string; city: string }) => {
    form.setValue('street_address', address.street);
    form.setValue('postal_code', address.postalCode);
    form.setValue('city', address.city);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="street_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{language === 'sv' ? 'Adress' : 'Address'}</FormLabel>
              <FormControl>
                <AddressSearchInput
                  value={field.value}
                  onChange={field.onChange}
                  onAddressSelect={handleAddressSelect}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="postal_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{language === 'sv' ? 'Postnummer' : 'Postal code'}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{language === 'sv' ? 'Postort' : 'City'}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <SheetClose asChild>
            <Button variant="outline">
              {language === 'sv' ? 'Avbryt' : 'Cancel'}
            </Button>
          </SheetClose>
          <Button type="submit">
            {language === 'sv' ? 'Spara' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  );
};