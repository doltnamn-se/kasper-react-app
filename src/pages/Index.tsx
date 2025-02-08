
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { PrivacyScoreCard } from "@/components/privacy/PrivacyScoreCard";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Spinner } from "@/components/ui/spinner";
import { HourlyCountdown } from "@/components/monitoring/HourlyCountdown";
import { format } from "date-fns";
import { sv, enUS } from "date-fns/locale";

const Index = () => {
  const { language } = useLanguage();
  const { userProfile } = useUserProfile();
  const [lastChecked, setLastChecked] = useState(new Date());

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Översikt | Doltnamn.se" : 
      "Overview | Doltnamn.se";
      
    const root = document.getElementById('root');
    if (root) {
      root.classList.add('animate-fadeIn');
    }

    // Set initial last checked time to the most recent 5-minute interval
    const now = new Date();
    const minutes = now.getMinutes();
    now.setMinutes(minutes - (minutes % 5));
    now.setSeconds(0);
    now.setMilliseconds(0);
    setLastChecked(now);

    // Update last checked time every 5 minutes
    const interval = setInterval(() => {
      const newTime = new Date();
      if (newTime.getMinutes() % 5 === 0 && newTime.getSeconds() === 0) {
        setLastChecked(newTime);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [language]);

  const displayName = userProfile?.display_name?.split(' ')[0] || '';

  const getFormattedDate = () => {
    if (language === 'sv') {
      return `CET ${format(lastChecked, 'HH:mm eeee d MMMM yyyy', { locale: sv })}`;
    }
    return `CET ${format(lastChecked, 'h:mma, EEEE, MMMM d, yyyy', { locale: enUS })}`;
  };

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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                {language === 'sv' ? 'Bevakning' : 'Monitoring'}
              </h2>
              <div className="flex items-center gap-3">
                <HourlyCountdown />
                <div className="flex items-center">
                  <Spinner size={24} />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start justify-center space-y-4">
              <p className="text-[#000000A6] dark:text-[#FFFFFFA6] font-medium text-sm">
                {language === 'sv' ? 
                  `Senast kontrollerat ${getFormattedDate()}` : 
                  `Last checked ${getFormattedDate()}`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;

