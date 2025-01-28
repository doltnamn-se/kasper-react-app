import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useChecklistProgress } from "@/hooks/useChecklistProgress";
import { Progress } from "@/components/ui/progress";

const Index = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { calculateProgress } = useChecklistProgress();
  const progress = calculateProgress();

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Översikt | Doltnamn.se" : 
      "Overview | Doltnamn.se";
  }, [language]);

  return (
    <MainLayout>
      <h1 className="text-2xl font-black tracking-[-.416px] text-[#000000] dark:text-white mb-6">
        {t('nav.home')}
      </h1>
      <div className="bg-white dark:bg-[#1c1c1e] p-4 md:p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
        <p className="text-[#000000] dark:text-gray-400 mb-6">
          {t('overview.welcome')}
        </p>
        
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-medium">
              {language === 'sv' ? 'Checklista framsteg' : 'Checklist Progress'}
            </span>
            <Progress value={progress} className="w-full" />
            <span className="text-sm text-gray-500">
              {progress}% {language === 'sv' ? 'slutfört' : 'completed'}
            </span>
          </div>
          
          <Button 
            onClick={() => navigate('/checklist')}
            className="w-full sm:w-auto"
          >
            {language === 'sv' ? 'Gå till checklista' : 'Go to checklist'}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;