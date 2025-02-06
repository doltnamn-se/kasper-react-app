
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import { PrivacyScoreCard } from "@/components/privacy/PrivacyScoreCard";
import { useUserProfile } from "@/hooks/useUserProfile";

const Index = () => {
  const { language } = useLanguage();
  const { userProfile } = useUserProfile();

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Översikt | Doltnamn.se" : 
      "Overview | Doltnamn.se";
      
    const root = document.getElementById('root');
    if (root) {
      root.classList.add('animate-fadeIn');
    }
  }, [language]);

  const displayName = userProfile?.display_name?.split(' ')[0] || '';

  return (
    <MainLayout>
      <div className="animate-fadeIn space-y-6">
        <h1 className="text-2xl font-black tracking-[-.416px] text-[#000000] dark:text-white mb-6">
          {language === 'sv' ? 
            `Välkommen, ${displayName} 👋` : 
            `Welcome, ${displayName} 👋`
          }
        </h1>

        <PrivacyScoreCard />
      </div>
    </MainLayout>
  );
};

export default Index;

