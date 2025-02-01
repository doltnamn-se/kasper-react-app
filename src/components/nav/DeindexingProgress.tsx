import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink } from "lucide-react";
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
        <h3 className="text-sm font-medium text-[#000000] dark:text-white mb-4">
          {language === 'sv' ? 'Använd Avindexering' : 'Used Deindexing'}
        </h3>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-[#000000] dark:text-white">
            <span>
              {language === 'sv' 
                ? `${usedUrls} av ${urlLimit}` 
                : `${usedUrls} out of ${urlLimit}`}
            </span>
          </div>
          
          <Progress value={progressPercentage} className="h-2" />
          
          <a
            href="https://buy.stripe.com/7sI00ZdkU1i11A4eV2"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-[#2e77d0] hover:text-[#1d4ed8] dark:text-[#60a5fa] dark:hover:text-[#93c5fd] mt-2"
          >
            {language === 'sv' 
              ? 'Behöver du fler länkar? Lägg till' 
              : 'Need more links? Add more'}
            <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};