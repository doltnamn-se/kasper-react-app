import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const DeindexingProgress = () => {
  const { t, language } = useLanguage();
  
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

  const urlLimit = urlLimits?.additional_urls || 0;
  const progressPercentage = (usedUrls / (urlLimit || 1)) * 100;

  return (
    <div className="mt-6">
      <Separator className="mb-6 bg-[#e5e7eb] dark:bg-[#2d2d2d]" />
      <div className="px-3">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-[#000000] dark:text-white">
            {language === 'sv' ? 'Avindexering' : 'Deindexing'}
          </h3>
          <span className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6]">
            {language === 'sv' 
              ? `${usedUrls} av ${urlLimit}` 
              : `${usedUrls} out of ${urlLimit}`}
          </span>
        </div>
        
        <Progress 
          value={progressPercentage} 
          className="h-3 bg-[#e8e8e5] dark:bg-[#2f2e31]" 
          indicatorClassName="bg-[#000000] dark:bg-[#c2c9f5]"
        />
        
        <div className="flex items-center gap-1 mt-4 text-xs">
          <span className="text-[#000000A6] dark:text-[#FFFFFFA6]">
            {t('deindexing.need.more')}
          </span>
          <a
            href="https://buy.stripe.com/7sI00ZdkU1i11A4eV2"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-[#000000] hover:text-[#1d4ed8] dark:text-white dark:hover:text-[#93c5fd]"
          >
            {language === 'sv' ? 'Lägg till' : 'Add more'}
            <ArrowRight className="ml-1 h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};