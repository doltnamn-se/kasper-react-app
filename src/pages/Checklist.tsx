import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChecklistContainer } from "@/components/checklist/ChecklistContainer";
import { Card } from "@/components/ui/card";
import { Check, ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Checklist = () => {
  const { t } = useLanguage();

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black tracking-[-.416px] text-[#000000] dark:text-white">
          {t('nav.checklist')}
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base font-black">{progress}%</span>
            </div>
            <PieChart width={80} height={80}>
              <defs>
                <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4d985e" />
                  <stop offset="100%" stopColor="#72bd5f" />
                </linearGradient>
                <linearGradient id="backgroundGradient" x1="0" y1="0" x2="1" y2="0">
                  <animate
                    attributeName="x1"
                    values="0;1;0"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="x2"
                    values="1;2;1"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                  <stop offset="0%" className="dark:text-[#1b5e20] text-[#e8f5e9]" stopColor="currentColor" />
                  <stop offset="100%" className="dark:text-[#2e7d32] text-[#c8e6c9]" stopColor="currentColor" />
                </linearGradient>
              </defs>
              <Pie
                data={progressData}
                innerRadius={25}
                outerRadius={35}
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
          <span className="text-sm">
            {t('step.progress', { current: calculateProgress() / 25, total: 4 })}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6 rounded-[4px] mb-6">
            <div className="space-y-8">
              <ChecklistContainer />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 rounded-[4px]">
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
                  className={`flex items-center justify-between p-4 rounded-lg ${!item.completed ? 'bg-[#f8f8f7]' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full ${item.completed ? 'opacity-40' : ''} bg-[#e0e0e0] flex items-center justify-center`}>
                      <span className="text-sm">{item.step}</span>
                    </div>
                    <div className={item.completed ? 'opacity-40' : ''}>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  {item.completed ? (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#219653] flex items-center justify-center">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleStepClick(item.step)}
                      className="flex-shrink-0 w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  )}
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