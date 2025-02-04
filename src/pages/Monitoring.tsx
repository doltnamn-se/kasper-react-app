import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";

const Monitoring = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { userProfile } = useUserProfile();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: monitoredUrls = [], refetch } = useQuery({
    queryKey: ['monitored-urls'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return [];

      const { data, error } = await supabase
        .from('monitored_urls')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error fetching monitored URLs:', error);
        return [];
      }

      return data || [];
    }
  });

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Övervakning | Doltnamn.se" : 
      "Monitoring | Doltnamn.se";

    const root = document.getElementById('root');
    if (root) {
      root.classList.add('animate-fadeIn');
    }
  }, [language]);

  const handleAddUrl = async () => {
    if (!searchTerm.trim()) {
      toast({
        variant: "destructive",
        title: t('error'),
        description: t('monitoring.url.required'),
      });
      return;
    }

    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          variant: "destructive",
          title: t('error'),
          description: t('auth.required'),
        });
        return;
      }

      const { error } = await supabase
        .from('monitored_urls')
        .insert([
          {
            url: searchTerm,
            user_id: session.user.id,
          }
        ]);

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('monitoring.url.added'),
      });

      setSearchTerm("");
      refetch();
    } catch (error) {
      console.error('Error adding URL:', error);
      toast({
        variant: "destructive",
        title: t('error'),
        description: t('monitoring.url.error'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUrl = async (urlId: number) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('monitored_urls')
        .delete()
        .eq('id', urlId);

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('monitoring.url.removed'),
      });

      refetch();
    } catch (error) {
      console.error('Error removing URL:', error);
      toast({
        variant: "destructive",
        title: t('error'),
        description: t('monitoring.url.remove.error'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="animate-fadeIn">
        <h1 className="text-2xl font-black tracking-[-.416px] text-[#000000] dark:text-white mb-6">
          {t('nav.monitoring')}
        </h1>

        <div className="bg-white dark:bg-[#1c1c1e] p-4 md:p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
          <div className="space-y-4">
            <div>
              <Label htmlFor="url">{t('monitoring.url.label')}</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  id="url"
                  type="url"
                  placeholder={t('monitoring.url.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleAddUrl}
                  disabled={isLoading || !searchTerm.trim()}
                >
                  {isLoading ? t('adding') : t('add')}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {monitoredUrls.map((item: any) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-[#f4f4f4] dark:bg-[#2c2c2e] rounded-[4px]"
                >
                  <span className="text-sm truncate flex-1">{item.url}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveUrl(item.id)}
                    className="ml-2"
                  >
                    {t('remove')}
                  </Button>
                </div>
              ))}
            </div>

            {monitoredUrls.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('monitoring.no.urls')}
              </p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Monitoring;