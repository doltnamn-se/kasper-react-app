import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types/customer";

const AddressAlerts = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState("address");
  const { userProfile } = useUserProfile();
  const [customerData, setCustomerData] = useState<Customer | null>(null);

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
        return "https://buy.stripe.com/aEU3db0y86Cl1A4cMR"; // Default to 1 month plan URL
    }
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
              {language === 'sv' ? 'Din Adress' : 'Your Address'}
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex-1">
              {language === 'sv' ? 'Larm' : 'Alarm'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="address" className="mt-6">
            <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
              <h2 className="text-xl font-semibold mb-6 dark:text-white">
                {language === 'sv' ? 'Din Adress' : 'Your Address'}
              </h2>
              <p className="text-[#000000A6] dark:text-[#FFFFFFA6] text-sm font-medium">
                {language === 'sv' 
                  ? 'Du har inte angett din adress ännu'
                  : 'You have not provided your address yet'
                }
              </p>
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