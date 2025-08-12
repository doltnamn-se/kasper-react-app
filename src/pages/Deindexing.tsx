
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { IncomingLinks } from "@/components/deindexing/IncomingLinks";
import { DeindexedLinks } from "@/components/deindexing/DeindexedLinks";
import { AdminDeindexingView } from "@/components/deindexing/AdminDeindexingView";
import { Button } from "@/components/ui/button";
import { Link2Off, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewLinkForm } from "@/components/deindexing/NewLinkForm";
import { useIsMobile } from "@/hooks/use-mobile";

const Deindexing = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState("incoming");
  const [showNewLinkForm, setShowNewLinkForm] = useState(false);
  const isMobile = useIsMobile();

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
      "Länkar | Kasper" : 
      "Links | Kasper";
  }, [language]);

  const urlLimit = urlLimits?.additional_urls || 0;
  // Updated logic to consider URL limit of 0 as having reached the limit
  const hasReachedLimit = urlLimit === 0 || usedUrls >= urlLimit;
  const isAdmin = profile?.role === 'super_admin';

  const handleNewLinkClick = () => {
    setShowNewLinkForm(!showNewLinkForm);
  };

  if (isAdmin) {
    return (
      <MainLayout>
        <div className="space-y-8">
          <h1 className="mb-6">
            {t('nav.my.links')} - Admin View
          </h1>
          <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
            <AdminDeindexingView />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Modified header section with flex layout for mobile */}
        <div className="flex flex-row justify-between items-center mb-6">
          <h1>
            {t('nav.my.links')} {isAdmin ? '- Admin View' : ''}
          </h1>
          
          {isMobile && (
            <Button 
              variant={hasReachedLimit ? "outline" : "default"}
              className={`px-4 py-0 flex items-center gap-2 ${
                hasReachedLimit 
                  ? "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-not-allowed h-10" 
                  : "bg-black text-white hover:bg-[#333333] dark:bg-white dark:text-black dark:hover:bg-[#c7c7c7] h-10"
              } rounded-full h-[2.5rem]`}
              disabled={hasReachedLimit}
              onClick={handleNewLinkClick}
            >
              {hasReachedLimit ? <Link2Off className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {language === 'sv' ? 'Ny länk' : 'New link'}
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col-reverse md:flex-row justify-between md:items-end w-full gap-4 md:gap-0">
              <TabsList className="relative w-full md:w-auto overflow-hidden">
                <div
                  className={`pointer-events-none absolute top-1 bottom-1 left-1 rounded-[12px] bg-[#d4f5b6] w-[calc(50%-0.25rem)] transition-transform duration-300 ease-out will-change-transform ${activeTab === 'incoming' ? 'translate-x-0' : 'translate-x-[calc(50%-0.25rem)]'}`}
                  aria-hidden
                />
                <TabsTrigger value="incoming" className="flex-1 relative z-10 data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent">
                  {t('deindexing.incoming.links')}
                </TabsTrigger>
                <TabsTrigger value="deindexed" className="flex-1 relative z-10 data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent">
                  {t('deindexing.deindexed.links')}
                </TabsTrigger>
              </TabsList>

              {/* Show button in this position only on desktop */}
              {!isMobile && (
                <div className="flex flex-col items-end">
                  <Button 
                    variant={hasReachedLimit ? "outline" : "default"}
                    className={`px-4 py-0 flex items-center gap-2 h-10 ${
                      hasReachedLimit 
                        ? "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-not-allowed h-10" 
                        : "bg-black text-white hover:bg-[#333333] dark:bg-white dark:text-black dark:hover:bg-[#c7c7c7] h-10"
                    } h-[2.5rem]`}
                    disabled={hasReachedLimit}
                    onClick={handleNewLinkClick}
                  >
                    {hasReachedLimit ? <Link2Off className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {language === 'sv' ? 'Ny länk' : 'New link'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {showNewLinkForm && (
            <div className="mt-2">
              <NewLinkForm onClose={() => setShowNewLinkForm(false)} />
            </div>
          )}

          <TabsContent value="incoming" className="mt-6">
            <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
              <h2 className="mb-6">
                {t('deindexing.incoming.links')}
              </h2>
              <IncomingLinks />
            </div>
          </TabsContent>

          <TabsContent value="deindexed" className="mt-6">
            <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
              <h2 className="mb-6">
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
