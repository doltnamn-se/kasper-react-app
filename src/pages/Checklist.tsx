import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChecklistContainer } from "@/components/checklist/ChecklistContainer";
import { Card } from "@/components/ui/card";
import { Check, ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

const Checklist = () => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  const { data: checklistProgress } = useQuery({
    queryKey: ['checklist-progress'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user session');

      const { data, error } = await supabase
        .from('customer_checklist_progress')
        .select('*')
        .eq('customer_id', session.user.id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const calculateProgress = () => {
    if (!checklistProgress) return 0;
    let completedSteps = 0;
    if (checklistProgress.password_updated) completedSteps++;
    if (checklistProgress.selected_sites?.length > 0) completedSteps++;
    if (checklistProgress.removal_urls?.length > 0) completedSteps++;
    if (checklistProgress.address && checklistProgress.personal_number) completedSteps++;
    return Math.round((completedSteps / 4) * 100);
  };

  const progress = calculateProgress();
  const progressData = [{ value: progress }, { value: 100 - progress }];
  const COLORS = ['url(#progressGradient)', 'url(#backgroundGradient)'];

  const handleStepClick = (stepNumber: number) => {
    const container = document.querySelector('.checklist-container');
    if (container) {
      container.querySelector(`[data-step="${stepNumber}"]`)?.scrollIntoView({ behavior: 'smooth' });
    }
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
            {t('step.progress', { current: calculateProgress() / 25, total: 4 })}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6 rounded-[4px] mb-6 dark:bg-[#1c1c1e]">
            <div className="space-y-8">
              <ChecklistContainer />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 rounded-[4px] dark:bg-[#1c1c1e]">
            <h2 className="text-lg font-semibold mb-4">{t('getting.started')}</h2>
            <div className="space-y-4">
              {[
                { step: 1, title: t('step.password.title'), description: t('step.password.description'), completed: checklistProgress?.password_updated },
                { step: 2, title: t('step.sites.title'), description: t('step.sites.description'), completed: checklistProgress?.selected_sites?.length > 0 },
                { step: 3, title: t('step.urls.title'), description: t('step.urls.description'), completed: checklistProgress?.removal_urls?.length > 0 },
                { step: 4, title: t('step.info.title'), description: t('step.info.description'), completed: checklistProgress?.address && checklistProgress?.personal_number },
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
                      <p className="text-sm text-[#616166] dark:text-[#FFFFFFA6] font-medium hidden xl:block">{item.description}</p>
                    </div>
                  </div>
                  <div className="pl-4 xl:pl-8">
                    {item.completed ? (
                      <div className="flex-shrink-0 w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-[#219653] flex items-center justify-center">
                        <Check className="w-4 h-4 xl:w-6 xl:h-6 text-white" />
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleStepClick(item.step)}
                        className="flex-shrink-0 w-8 h-8 xl:w-10 xl:h-10 rounded-full hover:bg-gray-100 dark:hover:bg-[#3A3A3B] flex items-center justify-center transition-colors"
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