import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChecklistContainer } from "@/components/checklist/ChecklistContainer";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";

const Checklist = () => {
  const { t } = useLanguage();

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white mb-6">
        {t('nav.checklist')}
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Compliance Health Score</h2>
                  <p className="text-sm text-gray-500">There's still room for improvement! Our scanner has detected 2 out of 3 privacy features on your site.</p>
                </div>
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">70%</span>
                  </div>
                  <Progress 
                    value={70} 
                    className="h-24 w-24 rounded-full [transform:rotate(-90deg)] ring-2 ring-offset-2 ring-offset-background"
                    indicatorClassName="bg-gradient-to-br from-teal-500 to-yellow-300"
                  />
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
            <h2 className="text-lg font-semibold mb-4">Getting Started</h2>
            <div className="space-y-4">
              {[
                { step: 1, title: "Connect a domain", description: "Connect a domain or URL to your account", completed: true },
                { step: 2, title: "Complete your compliance checklist", description: "Discover what privacy features your site needs", completed: true },
                { step: 3, title: "Install your first feature: Privacy Policy", description: "Configure and install your privacy policy", completed: true },
                { step: 4, title: "Install your required features", description: "Configure and install the rest of your required features", completed: false },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    {item.completed ? (
                      <Check className="w-4 h-4 text-green-500" />
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