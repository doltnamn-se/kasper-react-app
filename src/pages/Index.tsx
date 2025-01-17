import { MainLayout } from "@/components/layout/MainLayout";

const Index = () => {
  return (
    <MainLayout>
      <h1 className="text-2xl font-bold text-[#000000] dark:text-gray-300 mb-6 font-system-ui">Översikt</h1>
      <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[7px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
        <p className="text-[#000000] dark:text-gray-400 mb-4 font-system-ui">Välkommen till din översikt.</p>
      </div>
    </MainLayout>
  );
};

export default Index;