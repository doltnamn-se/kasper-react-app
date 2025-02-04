import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { SubscriptionSettings } from "@/components/settings/SubscriptionSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";

const Settings = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("account");

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Inställningar | Doltnamn.se" : 
      "Settings | Doltnamn.se";

    const root = document.getElementById('root');
    if (root) {
      root.classList.add('animate-fadeIn');
    }
  }, [language]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
        </div>
      </MainLayout>
    );
  }

  if (!userProfile) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-4">
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
            {t('settings.error.profile')}
          </p>
          <Button onClick={() => navigate('/')}>
            {t('settings.error.back')}
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="animate-fadeIn">
        <h1 className="text-2xl font-black tracking-[-.416px] text-[#000000] dark:text-white mb-6">
          {t('nav.settings')}
        </h1>

        <Tabs defaultValue="account" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="account">{t('settings.tabs.account')}</TabsTrigger>
            <TabsTrigger value="subscription">{t('settings.tabs.subscription')}</TabsTrigger>
            <TabsTrigger value="security">{t('settings.tabs.security')}</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="account">
              <AccountSettings userProfile={userProfile} />
            </TabsContent>
            
            <TabsContent value="subscription">
              <SubscriptionSettings userProfile={userProfile} />
            </TabsContent>
            
            <TabsContent value="security">
              <SecuritySettings userProfile={userProfile} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;