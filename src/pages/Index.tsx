import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, CheckSquare, Link, LogOut, User, Bell, UserCog, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

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
        "w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 rounded-lg",
        "hover:bg-[#F1F0FB] hover:text-[#8B5CF6]",
        active ? "bg-[#F1F0FB] text-[#8B5CF6] font-medium" : "text-[#1A1F2C]",
        className
      )}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F6F6F7] flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-[#E5DEFF] bg-white p-6 flex flex-col shadow-sm fixed h-screen">
        {/* User Profile Section */}
        <div className="flex items-center gap-4 px-4 py-4 mb-8 bg-[#F1F0FB] rounded-xl">
          <div className="w-10 h-10 rounded-full bg-[#E5DEFF] flex items-center justify-center">
            <User className="w-5 h-5 text-[#8B5CF6]" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-sm text-[#1A1F2C]">Användare</h3>
            <p className="text-xs text-[#6E59A5]">Inloggad</p>
          </div>
        </div>

        {/* Main Menu */}
        <nav className="flex-1 space-y-2">
          <MenuItem icon={LayoutDashboard} label="Översikt" active={true} />
          <MenuItem icon={CheckSquare} label="Checklista" />
          <MenuItem icon={Link} label="Mina länkar" />
        </nav>

        {/* Secondary Menu */}
        <div className="space-y-2 mb-4">
          <div className="h-px bg-[#E5DEFF] my-4" />
          <MenuItem 
            icon={Bell} 
            label="Notifikationer"
            onClick={() => console.log('Notifications clicked')}
          />
          <MenuItem 
            icon={UserCog} 
            label="Hantera konto"
            onClick={() => console.log('Account settings clicked')}
          />
          <MenuItem 
            icon={Moon} 
            label="Mörkt läge"
            onClick={toggleDarkMode}
            className={isDarkMode ? "text-[#8B5CF6]" : ""}
          />
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#E5DEFF] pt-4">
          <MenuItem 
            icon={LogOut} 
            label="Logga ut" 
            onClick={handleSignOut}
            className="text-[#D946EF] hover:bg-[#FFDEE2] hover:text-[#D946EF]" 
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 ml-72">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6 text-[#1A1F2C]">Översikt</h1>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-[#E5DEFF]">
            <p className="text-[#6E59A5]">Välkommen till din översikt.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;