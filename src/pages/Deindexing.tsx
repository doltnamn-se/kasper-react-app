import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DeindexingView } from "@/components/deindexing/DeindexingView";
import { LoadingState } from "@/components/deindexing/LoadingState";

const Deindexing = () => {
  const { language } = useLanguage();
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  const { data: deindexingData, isLoading } = useQuery({
    queryKey: ['deindexing-data'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data, error } = await supabase
        .from('customer_deindexing')
        .select('*')
        .eq('customer_id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching deindexing data:', error);
        return null;
      }

      return data;
    }
  });

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Avindexering | Doltnamn.se" : 
      "Deindexing | Doltnamn.se";

    const root = document.getElementById('root');
    if (root) {
      root.classList.add('animate-fadeIn');
    }
  }, [language]);

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="animate-fadeIn">
        <DeindexingView
          deindexingData={deindexingData}
          selectedUrls={selectedUrls}
          setSelectedUrls={setSelectedUrls}
        />
      </div>
    </MainLayout>
  );
};

export default Deindexing;