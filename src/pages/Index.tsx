import { LayoutDashboard, CheckSquare, Link } from "lucide-react";
import { cn } from "@/lib/utils";
import { TopNav } from "@/components/TopNav";
import { AuthLogo } from "@/components/auth/AuthLogo";
import { APP_VERSION } from "@/config/version";

const Index = () => {
  const MenuItem = ({ 
    icon: Icon, 
    label, 
    onClick, 
    className,
    active = false,
  }: { 
    icon: any; 
    label: string; 
    onClick?: () => void;
    className?: string;
    active?: boolean;
  }) => (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-2 py-2 text-sm transition-all duration-200 rounded-[4px]",
        "hover:bg-black/5 text-[#000000] dark:hover:bg-[#232325] dark:text-gray-300",
        active ? "font-medium" : "",
        className
      )}
    >
      <Icon className="w-4 h-4 transition-transform duration-200 ease-in-out stroke-[1.5] text-[#5e5e5e] dark:text-gray-300" />
      <span className="font-system-ui">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f4f4f4] dark:bg-[#161618] flex transition-colors duration-200">
      <aside className="w-72 border-r border-[#e5e7eb] dark:border-[#232325] bg-white dark:bg-[#1c1c1e] p-2 flex flex-col fixed h-screen transition-colors duration-200">
        <div className="px-2 py-4 mb-2">
          <AuthLogo />
        </div>

        <div className="h-px bg-[#e5e7eb] dark:bg-[#232325] mb-4 transition-colors duration-200" />

        <nav className="flex-1 space-y-1">
          <MenuItem icon={LayoutDashboard} label="Översikt" active={true} />
          <MenuItem icon={CheckSquare} label="Checklista" />
          <MenuItem icon={Link} label="Mina länkar" />
        </nav>

        <div className="px-2 py-3">
          <span className="text-xs text-[#5e5e5e] dark:text-gray-400">v{APP_VERSION}</span>
        </div>
      </aside>

      <TopNav />

      <main className="flex-1 p-8 ml-72 mt-16">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-[#000000] dark:text-gray-300 mb-6 font-system-ui">Översikt</h1>
          <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[7px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
            <p className="text-[#000000] dark:text-gray-400 mb-4 font-system-ui">Välkommen till din översikt.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;