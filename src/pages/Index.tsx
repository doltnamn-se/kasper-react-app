import React, { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { PrivacyScoreCard } from "@/components/privacy/PrivacyScoreCard";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Spinner } from "@/components/ui/spinner";
import { HourlyCountdown } from "@/components/monitoring/HourlyCountdown";
import { format } from "date-fns";
import { sv, enUS } from "date-fns/locale";
import { Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const { language } = useLanguage();
  const { userProfile } = useUserProfile();
  const [lastChecked, setLastChecked] = useState(new Date());
  const [isScanning, setIsScanning] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Översikt | Digitaltskydd.se" : 
      "Overview | Digitaltskydd.se";
      
    const now = new Date();
    const minutes = now.getMinutes();
    const currentInterval = minutes - (minutes % 5);
    
    const isInScanningPeriod = minutes % 5 === 0;
    setIsScanning(isInScanningPeriod);
    
    if (isInScanningPeriod) {
      const previousInterval = new Date(now);
      previousInterval.setMinutes(currentInterval - 5);
      previousInterval.setSeconds(0);
      previousInterval.setMilliseconds(0);
      setLastChecked(previousInterval);
    } else {
      const lastInterval = new Date(now);
      lastInterval.setMinutes(currentInterval);
      lastInterval.setSeconds(0);
      lastInterval.setMilliseconds(0);
      setLastChecked(lastInterval);
    }

    const interval = setInterval(() => {
      const newTime = new Date();
      const newMinutes = newTime.getMinutes();
      const newSeconds = newTime.getSeconds();
      
      const shouldBeScanningNow = newMinutes % 5 === 0;
      setIsScanning(shouldBeScanningNow);
      
      if (newMinutes % 5 === 1 && newSeconds === 0) {
        const lastInterval = new Date(newTime);
        lastInterval.setMinutes(newMinutes - 1);
        lastInterval.setSeconds(0);
        lastInterval.setMilliseconds(0);
        setLastChecked(lastInterval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [language]);

  useEffect(() => {
    if (isScanning) {
      let count = 0;
      const dotInterval = setInterval(() => {
        count = (count + 1) % 4;
        setDots('.'.repeat(count));
      }, 500);

      return () => clearInterval(dotInterval);
    } else {
      setDots('');
    }
  }, [isScanning]);

  const displayName = userProfile?.display_name || '';
  const firstNameOnly = displayName.split(' ')[0];

  const getFormattedDate = () => {
    if (language === 'sv') {
      return `CET ${format(lastChecked, 'HH:mm eeee d MMMM yyyy', { locale: sv })}`;
    }
    return `CET ${format(lastChecked, 'h:mma, EEEE, MMMM d, yyyy', { locale: enUS })}`;
  };

  return (
    <MainLayout>
      <div className="space-y-6 pb-20 md:pb-0">
        <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white mb-6">
          {language === 'sv' ? 
            `Välkommen, ${firstNameOnly} 👋` : 
            `Welcome, ${firstNameOnly} 👋`
          }
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PrivacyScoreCard />
          <div className="bg-white dark:bg-[#1c1c1e] p-4 md:p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                {language === 'sv' ? 'Status' : 'Status'}
              </h2>
              <div className="flex items-center gap-3">
                <HourlyCountdown />
                <div className="flex items-center">
                  <Spinner color={isScanning ? "#ea384c" : "#20f922"} size={24} />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start justify-center space-y-2">
              <p className="text-[#000000A6] dark:text-[#FFFFFFA6] font-medium text-xs mt-12">
                {language === 'sv' ? 
                  `Senast kontrollerat ${getFormattedDate()}` : 
                  `Last checked ${getFormattedDate()}`
                }
              </p>
              <p className="text-[#000000] dark:text-white text-lg" style={{ marginBottom: '55px' }}>
                <span className="font-normal">
                  {language === 'sv' ? 
                    'Bevakar nya sökträffar för ' : 
                    'Monitoring new search hits for '
                  }
                </span>
                <span className="font-bold">{displayName}</span>
              </p>
              <div className="flex items-center">
                <Badge 
                  variant="outline" 
                  className={`flex items-center gap-2 mt-2 font-medium border-[#d4d4d4] dark:border-[#363636] bg-[#fdfdfd] dark:bg-[#242424] text-[0.8rem] py-2 transition-all duration-500 ease-in-out ${isScanning ? 'w-[120px]' : 'w-[200px]'}`}
                >
                  <div className="relative w-[0.9rem] h-[0.9rem]">
                    <Activity className="w-full h-full absolute inset-0 text-transparent" />
                    <Activity 
                      className={`w-full h-full absolute inset-0 ${isScanning ? 'text-[#ea384c] animate-icon-fill' : 'text-[#000000A6] dark:text-[#FFFFFFA6]'}`} 
                    />
                  </div>
                  <span className="inline-flex items-center whitespace-nowrap">
                    {isScanning ? 
                      (language === 'sv' ? 
                        <><span>Skannar</span><span className="inline-block w-[24px]">{dots}</span></> : 
                        <><span>Scanning</span><span className="inline-block w-[24px]">{dots}</span></>
                      ) :
                      (language === 'sv' ? 'Inga nya träffar på Google' : 'No new hits on Google')
                    }
                  </span>
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
