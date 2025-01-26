import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

export const IncomingLinks = () => {
  const { t } = useLanguage();
  
  const { data: urls, isLoading } = useQuery({
    queryKey: ['incoming-urls'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user session');

      const { data, error } = await supabase
        .from('removal_urls')
        .select('*')
        .eq('customer_id', session.user.id)
        .eq('display_in_incoming', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  if (!urls?.length) {
    return (
      <div className="text-sm text-gray-500">
        No incoming links found. Add links from your checklist to see them here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {urls.map((url) => (
        <div 
          key={url.id} 
          className="p-4 bg-white dark:bg-[#1c1c1e] rounded-lg border border-gray-200 dark:border-gray-800"
        >
          <a 
            href={url.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 dark:text-blue-400 hover:underline break-all"
          >
            {url.url}
          </a>
          <div className="mt-2 text-sm text-gray-500">
            Added: {new Date(url.created_at).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
};