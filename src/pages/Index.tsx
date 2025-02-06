
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PrivacyScoreCard />
          <div className="bg-white dark:bg-[#1c1c1e] p-4 md:p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
            <h2 className="text-lg font-semibold mb-4">
              {language === 'sv' ? 'Aktivitet' : 'Activity'}
            </h2>
            <p className="text-[#000000A6] dark:text-[#FFFFFFA6] font-medium text-sm">
              {language === 'sv' ? 
                'Ingen aktivitet att visa än' : 
                'No activity to show yet'
              }
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
