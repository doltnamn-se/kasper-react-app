import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";

const LoadingDemo = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Current Spinner */}
      <div className="p-6 bg-white dark:bg-[#1c1c1e] rounded-lg border border-[#e5e7eb] dark:border-[#232325]">
        <h3 className="text-sm font-medium mb-4">Current Spinner</h3>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      </div>

      {/* Pulse Animation */}
      <div className="p-6 bg-white dark:bg-[#1c1c1e] rounded-lg border border-[#e5e7eb] dark:border-[#232325]">
        <h3 className="text-sm font-medium mb-4">Pulse Animation</h3>
        <div className="flex items-center justify-center h-32">
          <div className="animate-pulse h-8 w-8 bg-gray-900 dark:bg-white rounded-full"></div>
        </div>
      </div>

      {/* Ping Animation */}
      <div className="p-6 bg-white dark:bg-[#1c1c1e] rounded-lg border border-[#e5e7eb] dark:border-[#232325]">
        <h3 className="text-sm font-medium mb-4">Ping Animation</h3>
        <div className="flex items-center justify-center h-32">
          <div className="relative">
            <div className="animate-ping absolute h-8 w-8 rounded-full bg-gray-900 dark:bg-white opacity-75"></div>
            <div className="relative h-8 w-8 rounded-full bg-gray-900 dark:bg-white"></div>
          </div>
        </div>
      </div>

      {/* Bounce Animation */}
      <div className="p-6 bg-white dark:bg-[#1c1c1e] rounded-lg border border-[#e5e7eb] dark:border-[#232325]">
        <h3 className="text-sm font-medium mb-4">Bounce Animation</h3>
        <div className="flex items-center justify-center h-32">
          <div className="flex space-x-2">
            <div className="animate-bounce h-2 w-2 bg-gray-900 dark:bg-white rounded-full"></div>
            <div className="animate-bounce h-2 w-2 bg-gray-900 dark:bg-white rounded-full delay-100"></div>
            <div className="animate-bounce h-2 w-2 bg-gray-900 dark:bg-white rounded-full delay-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Checklist = () => {
  const { t } = useLanguage();

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white mb-6">
        {t('nav.checklist')}
      </h1>
      <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[7px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
        <h2 className="text-lg font-semibold mb-4">Loading Animation Options</h2>
        <LoadingDemo />
      </div>
    </MainLayout>
  );
};

export default Checklist;