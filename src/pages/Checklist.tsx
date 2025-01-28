import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Check, ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell } from 'recharts';
import { useChecklistProgress } from "@/hooks/useChecklistProgress";
import { useChecklistItems } from "@/hooks/useChecklistItems";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";

const Checklist = () => {
  const { t, language } = useLanguage();
  const isMobile = useIsMobile();
  const { checklistProgress, calculateProgress } = useChecklistProgress();
  const { checklistItems } = useChecklistItems();

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Checklista | Doltnamn.se" : 
      "Checklist | Doltnamn.se";
  }, [language]);

  const progress = calculateProgress();
  const progressData = [{ value: progress }, { value: 100 - progress }];
  const COLORS = ['url(#progressGradient)', 'url(#backgroundGradient)'];

  const getTotalSteps = () => {
    const baseSteps = 4;
    const selectedSitesCount = checklistProgress?.selected_sites?.length || 0;
    return baseSteps + selectedSitesCount;
  };

  const handleStepClick = (stepNumber: number) => {
    console.log('Clicking step:', stepNumber);
    const checklistContainer = document.querySelector('.step-content-wrapper');
    if (!checklistContainer) {
      console.log('Container not found');
      return;
    }

    const stepElement = checklistContainer.querySelector(`[data-step="${stepNumber}"]`);
    if (stepElement) {
      console.log('Found step element, scrolling to it');
      stepElement.scrollIntoView({ behavior: 'smooth' });
      
      const containerInstance = document.querySelector('.checklist-component') as any;
      if (containerInstance && containerInstance.__reactFiber$) {
        const instance = containerInstance.__reactFiber$.child?.stateNode;
        if (instance && instance.setCurrentStep) {
          console.log('Updating current step to:', stepNumber);
          instance.setCurrentStep(stepNumber);
        } else {
          console.log('setCurrentStep not found on instance');
        }
      } else {
        console.log('Container instance not found');
      }
    } else {
      console.log('Step element not found');
    }
  };

  const getGuideTitle = (site: string): string => {
    // Map site identifiers to their corresponding translation keys
    const siteTranslationKeys: Record<string, keyof Translations> = {
      'eniro': 'guide.eniro.title',
      'mrkoll': 'guide.mrkoll.title',
      'hitta': 'guide.hitta.title',
      'merinfo': 'guide.merinfo.title',
      'ratsit': 'guide.ratsit.title',
      'birthday': 'guide.birthday.title',
      'upplysning': 'guide.upplysning.title'
    };

    const translationKey = siteTranslationKeys[site.toLowerCase()];
    return translationKey ? t(translationKey) : site;
  };

  return (
    <MainLayout>
      <div className="flex flex-wrap items-center gap-8 mb-6">
        <h1 className="text-2xl font-black tracking-[-.416px] text-[#000000] dark:text-white">
          {t('nav.checklist')}
        </h1>
        <div className={`relative ${isMobile ? 'w-16 h-16' : 'w-20 h-20'}`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-black ${isMobile ? 'text-sm' : 'text-base'}`}>{progress}%</span>
          </div>
          <PieChart width={isMobile ? 64 : 80} height={isMobile ? 64 : 80}>
            <defs>
              <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="0">
                <animate
                  attributeName="x1"
                  values="0;1;0"
                  dur="8s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="x2"
                  values="1;2;1"
                  dur="8s"
                  repeatCount="indefinite"
                />
                <stop offset="0%" stopColor="#4d985e">
                  <animate
                    attributeName="offset"
                    values="0;0.5;0"
                    dur="8s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="100%" stopColor="#72bd5f">
                  <animate
                    attributeName="offset"
                    values="0.5;1;0.5"
                    dur="8s"
                    repeatCount="indefinite"
                  />
                </stop>
              </linearGradient>
              <linearGradient id="backgroundGradient" x1="0" y1="0" x2="1" y2="0">
                <animate
                  attributeName="x1"
                  values="0;1;0"
                  dur="8s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="x2"
                  values="1;2;1"
                  dur="8s"
                  repeatCount="indefinite"
                />
                <stop offset="0%" className="dark:text-[#243024] text-[#e8f5e9]" stopColor="currentColor" />
                <stop offset="100%" className="dark:text-[#2f4030] text-[#c8e6c9]" stopColor="currentColor" />
              </linearGradient>
            </defs>
            <Pie
              data={progressData}
              innerRadius={isMobile ? 20 : 25}
              outerRadius={isMobile ? 28 : 35}
              paddingAngle={0}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              {progressData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </div>
        {!isMobile && (
          <span className="text-sm font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
            {t('step.progress', { current: Math.ceil(progress / (100 / getTotalSteps())), total: getTotalSteps() })}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6 rounded-[4px] mb-6 dark:bg-[#1c1c1e] dark:border-[#232325]">
            <div className="space-y-8 checklist-container">
              <div className="checklist-component">
                <ChecklistContainer />
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 rounded-[4px] dark:bg-[#1c1c1e] dark:border-[#232325]">
            <h2 className="text-lg font-semibold mb-4">{t('getting.started')}</h2>
            <div className="space-y-4">
              {[
                { step: 1, title: t('step.1.title'), completed: checklistProgress?.password_updated },
                { step: 2, title: t('step.2.title'), completed: checklistProgress?.removal_urls?.length > 0 },
                { step: 3, title: t('step.3.title'), completed: checklistProgress?.selected_sites?.length > 0 },
                ...(checklistProgress?.selected_sites || []).map((site, index) => ({
                  step: 4 + index,
                  title: getGuideTitle(site),
                  completed: checklistProgress?.completed_guides?.includes(site)
                })),
                { 
                  step: 4 + (checklistProgress?.selected_sites?.length || 0), 
                  title: t('step.4.title'), 
                  completed: checklistProgress?.address && checklistProgress?.personal_number 
                }
              ].map((item) => (
                <div 
                  key={item.step} 
                  className={`flex items-center justify-between p-4 rounded-lg ${!item.completed ? 'bg-[#f8f8f7] dark:bg-[#2A2A2B]' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 xl:w-10 xl:h-10 rounded-full ${item.completed ? 'opacity-40' : ''} bg-[#e0e0e0] dark:bg-[#3A3A3B] flex items-center justify-center`}>
                      <span className="text-xs xl:text-sm font-medium">{item.step}</span>
                    </div>
                    <div className={item.completed ? 'opacity-40' : ''}>
                      <p className="text-sm xl:text-base font-medium">{item.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {item.completed ? (
                      <div className="flex-shrink-0 w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-[#219653] flex items-center justify-center">
                        <Check className="w-4 h-4 xl:w-6 xl:h-6 text-white" />
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleStepClick(item.step)}
                        className="flex-shrink-0 w-8 h-8 xl:w-10 xl:h-10 rounded-full hover:bg-gray-100 dark:hover:bg-[#3A3A3B] flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4 xl:w-6 xl:h-6" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Checklist;