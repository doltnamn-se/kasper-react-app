
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link2, Link2Off } from "lucide-react";
import { Button } from "@/components/ui/button";

interface URLLimitDisplayProps {
  onNewLinkClick: () => void;
  showNewLinkForm: boolean;
}

export const URLLimitDisplay = ({ onNewLinkClick, showNewLinkForm }: URLLimitDisplayProps) => {
  const { language } = useLanguage();
  
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
  const hasReachedLimit = urlLimit === 0 || usedUrls >= urlLimit;

  return (
    <Button 
      variant={hasReachedLimit ? "outline" : "default"}
      className={`h-10 flex items-center gap-2 ${
        hasReachedLimit 
          ? "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-not-allowed" 
          : "bg-black text-white hover:bg-[#333333] dark:bg-white dark:text-black dark:hover:bg-[#c7c7c7]"
      }`}
      disabled={hasReachedLimit}
      onClick={onNewLinkClick}
    >
      {hasReachedLimit ? <Link2Off className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      {language === 'sv' ? 'Ny länk' : 'New link'}
    </Button>
  );
};
