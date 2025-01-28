import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types/customer";
import { HousePlus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

interface AddressFormData {
  street_address: string;
  postal_code: string;
  city: string;
}

const AddressAlerts = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState("address");
  const { userProfile } = useUserProfile();
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const { toast } = useToast();
  const form = useForm<AddressFormData>();

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Adresslarm | Doltnamn.se" : 
      "Address Alerts | Doltnamn.se";
  }, [language]);

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!userProfile?.id) return;

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', userProfile.id)
        .single();

      if (error) {
        console.error('Error fetching customer data:', error);
        return;
      }

      setCustomerData(data);
    };

    fetchCustomerData();
  }, [userProfile?.id]);

  const getStripeUrl = () => {
    switch (customerData?.subscription_plan) {
      case "1_month":
        return "https://buy.stripe.com/aEU3db0y86Cl1A4cMR";
      case "6_months":
        return "https://buy.stripe.com/7sI8xv1Cc5yha6AfZ4";
      case "12_months":
        return "https://buy.stripe.com/dR600Z5SsgcV2E85kr";
      default:
        return "https://buy.stripe.com/aEU3db0y86Cl1A4cMR";
    }
  };

  const onSubmit = async (data: AddressFormData) => {
    if (!userProfile?.id) return;

    const { error } = await supabase
      .from('customer_checklist_progress')
      .upsert({
        customer_id: userProfile.id,
        street_address: data.street_address,
        postal_code: data.postal_code,
        city: data.city,
      });

    if (error) {
      console.error('Error saving address:', error);
      toast({
        title: language === 'sv' ? "Ett fel uppstod" : "An error occurred",
        description: language === 'sv' ? 
          "Det gick inte att spara adressen" : 
          "Could not save the address",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: language === 'sv' ? "Adress sparad" : "Address saved",
      description: language === 'sv' ? 
        "Din adress har sparats" : 
        "Your address has been saved",
    });
  };

  const hasAddressAlert = customerData?.has_address_alert;

  return (
    <MainLayout>
      <div className="relative max-w-md mx-auto space-y-8">
        <h1 className="text-2xl font-black tracking-[-.416px] text-[#000000] dark:text-white mb-6">
          {t('nav.address.alerts')}
        </h1>

        {!hasAddressAlert && (
          <div className="absolute inset-0 z-10 backdrop-blur-sm bg-white/30 dark:bg-black/30 flex items-center justify-center">
            <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-lg shadow-lg max-w-sm text-center space-y-4">
              <p className="text-[#000000A6] dark:text-[#FFFFFFA6] text-sm">
                {language === 'sv' 
                  ? "Du prenumererar inte på Adresslarm. Lägg till det nu för att hålla dina adressuppgifter säkra."
                  : "You are not subscribed to Address Alerts. Add it now to keep your address details safe."
                }
              </p>
              <Button 
                onClick={() => window.location.href = getStripeUrl()}
                className="w-full"
              >
                {language === 'sv' ? "Lägg till Adresslarm" : "Add Address Alerts"}
              </Button>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="address" className="flex-1">
              {language === 'sv' ? 'Din adress' : 'Your Address'}
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex-1">
              {language === 'sv' ? 'Larm' : 'Alarm'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="address" className="mt-6">
            <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
              <h2 className="text-xl font-semibold mb-6 dark:text-white">
                {language === 'sv' ? 'Din adress' : 'Your Address'}
              </h2>
              <p className="text-[#000000A6] dark:text-[#FFFFFFA6] text-sm font-medium mb-4">
                {language === 'sv' 
                  ? 'Du har inte angett din adress ännu'
                  : 'You have not provided your address yet'
                }
              </p>
              <Sheet>
                <SheetTrigger asChild>
                  <Button className="w-full">
                    <HousePlus className="mr-2 h-4 w-4" />
                    {language === 'sv' ? 'Lägg till adress' : 'Add new address'}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>
                      {language === 'sv' ? 'Lägg till adress' : 'Add new address'}
                    </SheetTitle>
                  </SheetHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                      <FormField
                        control={form.control}
                        name="street_address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{language === 'sv' ? 'Adress' : 'Address'}</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                      <Button type="submit" className="w-full">
                        {language === 'sv' ? 'Spara' : 'Save'}
                      </Button>
                    </form>
                  </Form>
                </SheetContent>
              </Sheet>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
              <h2 className="text-xl font-semibold mb-6 dark:text-white">
                {language === 'sv' ? 'Larm' : 'Alarm'}
              </h2>
              <p className="text-[#000000A6] dark:text-[#FFFFFFA6] text-sm font-medium">
                {language === 'sv'
                  ? 'Det finns inga tidigare larm rörande din adress'
                  : 'There are no previous alarms regarding your address'
                }
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AddressAlerts;