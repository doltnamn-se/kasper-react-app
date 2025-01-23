import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChecklistContainer } from "@/components/checklist/ChecklistContainer";
import { Card } from "@/components/ui/card";
import { Check, ArrowRight } from "lucide-react";
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

  // Calculate progress based on completed steps
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
  const COLORS = ['url(#progressGradient)', '#F3F4F6'];

  const handleStepClick = (stepNumber: number) => {
    // Update the current step in ChecklistContainer
    // This will be handled by the parent component's state
    console.log('Navigating to step:', stepNumber);
  };

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white mb-6">
        {t('nav.checklist')}
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-start">
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold mb-4">{t('your.progress')}</h2>
                <div className="flex items-center gap-8">
                  <div className="relative w-40 h-40">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">{progress}%</span>
                    </div>
                    <PieChart width={160} height={160}>
                      <defs>
                        <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#4d985e" />
                          <stop offset="100%" stopColor="#72bd5f" />
                        </linearGradient>
                      </defs>
                      <Pie
                        data={progressData}
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={0}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {progressData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </div>
                  <span className="text-sm text-gray-500">
                    {t('step.progress').replace('{current}', '1').replace('{total}', '4')}
                  </span>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <ChecklistContainer />
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6">
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
                  className="flex items-start justify-between p-4 bg-[#f8f8f7] rounded-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#e0e0e0] flex items-center justify-center">
                      <span className="text-sm">{item.step}</span>
                    </div>
                    <div className={`flex-1 ${item.completed ? 'opacity-40' : ''}`}>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  {item.completed ? (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#219653] flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleStepClick(item.step)}
                      className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
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