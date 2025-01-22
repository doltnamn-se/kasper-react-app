import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChecklistContainer } from "@/components/checklist/ChecklistContainer";
import { Card } from "@/components/ui/card";

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
            <ChecklistContainer />
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Getting Started</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center text-sm">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Update Password</p>
                  <p className="text-sm text-gray-500">Secure your account</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center text-sm">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Select Hiding Sites</p>
                  <p className="text-sm text-gray-500">Choose where to hide information</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center text-sm">
                  3
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Submit URLs</p>
                  <p className="text-sm text-gray-500">Add URLs for removal</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center text-sm">
                  4
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Personal Information</p>
                  <p className="text-sm text-gray-500">Complete your profile</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Checklist;