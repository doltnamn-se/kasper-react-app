import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChecklistContainer } from "@/components/checklist/ChecklistContainer";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { PieChart, Pie, Cell } from 'recharts';

const Checklist = () => {
  const { t } = useLanguage();
  const progressData = [{ value: 70 }, { value: 30 }];
  const COLORS = ['url(#progressGradient)', '#F3F4F6'];

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white mb-6">
        {t('nav.checklist')}
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold">Your Progress</h2>
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">70%</span>
                </div>
                <PieChart width={96} height={96}>
                  <defs>
                    <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={progressData}
                    innerRadius={35}
                    outerRadius={45}
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
            </div>
          </Card>
          
          <Card className="p-6">
            <ChecklistContainer />
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Getting Started</h2>
            <div className="space-y-4">
              {[
                { step: 1, title: "Connect a domain", description: "Connect a domain or URL to your account", completed: true },
                { step: 2, title: "Complete your compliance checklist", description: "Discover what privacy features your site needs", completed: true },
                { step: 3, title: "Install your first feature: Privacy Policy", description: "Configure and install your privacy policy", completed: true },
                { step: 4, title: "Install your required features", description: "Configure and install the rest of your required features", completed: false },
              ].map((item) => (
                <div 
                  key={item.step} 
                  className={`flex items-start gap-4 ${item.completed ? 'opacity-60' : ''}`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    item.completed ? 'bg-[#F2FCE2]' : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    {item.completed ? (
                      <Check className="w-4 h-4 text-white stroke-[#86efac]" />
                    ) : (
                      <span className="text-sm">{item.step}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
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