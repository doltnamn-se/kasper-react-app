
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { IncomingLinks } from "@/components/deindexing/IncomingLinks";
import { DeindexedLinks } from "@/components/deindexing/DeindexedLinks";
import { AdminDeindexingView } from "@/components/deindexing/AdminDeindexingView";
import { Button } from "@/components/ui/button";
import { Link2, Link2Off, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewLinkForm } from "@/components/deindexing/NewLinkForm";

const Deindexing = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState("incoming");
  const [showNewLinkForm, setShowNewLinkForm] = useState(false);

  // Add useEffect to mark deindexing notifications as read
  useEffect(() => {
    const markDeindexingNotificationsAsRead = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      console.log('Marking deindexing notifications as read');
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', session.user.id)
        .eq('type', 'removal')
        .eq('read', false);

      if (error) {
        console.error('Error marking notifications as read:', error);
      } else {
        console.log('Successfully marked deindexing notifications as read');
      }
    };

    markDeindexingNotificationsAsRead();
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    }
  });

  const { data: urlLimits } = useQuery({
    queryKey: ['url-limits'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;
      
      const { data, error } = await supabase
        .from('user_url_limits')
        .select('additional_urls')
        .eq('customer_id', session.user.id)
        .single();
        
      if (error) {
        console.error('Error fetching URL limits:', error);
        return null;
      }
      return data;
    }
  });

  const { data: usedUrls = 0 } = useQuery({
    queryKey: ['used-urls'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return 0;
      
      const { data, error } = await supabase
        .from('removal_urls')
        .select('id', { count: 'exact' })
        .eq('customer_id', session.user.id);
        
      if (error) {
        console.error('Error fetching used URLs:', error);
        return 0;
      }
      return data?.length || 0;
    }
  });

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Avindexering | Digitaltskydd.se" : 
      "Deindexing | Digitaltskydd.se";
  }, [language]);

  const urlLimit = urlLimits?.additional_urls || 0;
  const hasReachedLimit = usedUrls >= urlLimit;
  const isAdmin = profile?.role === 'super_admin';

  const handleNewLinkClick = () => {
    setShowNewLinkForm(!showNewLinkForm);
  };

  if (isAdmin) {
    return (
      <MainLayout>
        <div className="space-y-8">
          <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white mb-6">
            {t('nav.my.links')} - Admin View
          </h1>
          <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
            <AdminDeindexingView />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white mb-6">
          {t('nav.my.links')} {isAdmin ? '- Admin View' : ''}
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col-reverse md:flex-row justify-between md:items-end w-full gap-4 md:gap-0">
              <TabsList className="h-10 w-full md:w-auto">
                <TabsTrigger value="incoming" className="flex-1">
                  {t('deindexing.incoming.links')}
                </TabsTrigger>
                <TabsTrigger value="deindexed" className="flex-1">
                  {t('deindexing.deindexed.links')}
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-col items-end">
                <div className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6] mb-2">
                  {language === 'sv' 
                    ? `${usedUrls} av ${urlLimit} använda`
                    : `${usedUrls} out of ${urlLimit} used`}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="default" 
                    className="h-10 flex items-center gap-2 bg-black text-white hover:bg-[#333333] dark:bg-white dark:text-black dark:hover:bg-[#c7c7c7]"
                    disabled={hasReachedLimit}
                    onClick={handleNewLinkClick}
                  >
                    {hasReachedLimit ? <Link2Off className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                    {language === 'sv' ? 'Ny länk' : 'New link'}
                  </Button>
                  <Button
                    variant="default"
                    className="h-10 flex items-center gap-2 bg-black text-white hover:bg-[#333333] dark:bg-white dark:text-black dark:hover:bg-[#c7c7c7]"
                    onClick={() => window.open('https://buy.stripe.com/7sI00ZdkU1i11A4eV2', '_blank')}
                  >
                    <span>{language === 'sv' ? 'Lägg till' : 'Add more'}</span>
                    <ArrowRight className="h-4 w-4 -rotate-45" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {showNewLinkForm && (
            <div className="mt-2">
              <NewLinkForm onClose={() => setShowNewLinkForm(false)} />
            </div>
          )}

          <TabsContent value="incoming" className="mt-6">
            <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
              <h2 className="text-xl font-semibold mb-6 dark:text-white">
                {t('deindexing.incoming.links')}
              </h2>
              <IncomingLinks />
            </div>
          </TabsContent>

          <TabsContent value="deindexed" className="mt-6">
            <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
              <h2 className="text-xl font-semibold mb-6 dark:text-white">
                {t('deindexing.deindexed.links')}
              </h2>
              <DeindexedLinks />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Deindexing;
