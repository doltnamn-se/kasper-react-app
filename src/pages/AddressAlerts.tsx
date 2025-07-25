
import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Customer } from "@/types/customer";
import { supabase } from "@/integrations/supabase/client";
import { AddressDisplay } from "@/components/address/AddressDisplay";
import { AlertsDisplay } from "@/components/address/AlertsDisplay";
import { Button } from "@/components/ui/button";

// Utility function to get Stripe URL
const getStripeUrl = () => {
  return "https://billing.stripe.com/p/login/eVa4ifayTfS48la7ss";
};

const AddressAlerts = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("address");
  const { userProfile } = useUserProfile();
  const [customerData, setCustomerData] = useState<Customer | null>(null);

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

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Adresslarm | Kasper" : 
      "Address Alerts | Kasper";
  }, [language]);

  useEffect(() => {
    fetchCustomerData();
  }, [userProfile?.id]);

  const hasAddressAlert = customerData?.has_address_alert;

  return (
    <MainLayout>
      <div className="relative max-w-md space-y-8">
        <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white mb-6">
          {language === 'sv' ? 'Adresslarm' : 'Address Alerts'}
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
            <AddressDisplay onAddressUpdate={fetchCustomerData} />
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <AlertsDisplay />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AddressAlerts;
