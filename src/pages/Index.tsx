import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, CheckSquare, Link, LogOut, User, Bell, UserCog, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { language } = useLanguage();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Översikt | Doltnamn.se" : 
      "Dashboard | Doltnamn.se";

    const isDark = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserEmail(user.email);
      }
    });
  }, [language]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleTestEmail = async () => {
    if (!userEmail) {
      toast.error("No user email found");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: { email: userEmail }
      });

      if (error) {
        throw new Error(error.message || "Failed to send test email");
      }

      toast.success("Test email sent successfully! Check your inbox.");
    } catch (error: any) {
      console.error("Error sending test email:", error);
      toast.error(error.message || "Failed to send test email");
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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
        "hover:bg-[#F1F0FB] hover:text-[#8B5CF6] dark:hover:bg-slate-800 dark:hover:text-purple-400",
        active ? "bg-[#F1F0FB] text-[#8B5CF6] font-medium dark:bg-slate-800 dark:text-purple-400" : "text-[#1A1F2C] dark:text-slate-200",
        className
      )}
    >
      <Icon className="w-5 h-5 transition-transform duration-200 ease-in-out stroke-[1.5]" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F6F6F7] dark:bg-slate-900 flex">
      <aside className="w-72 border-r border-[#E5DEFF] dark:border-slate-700 bg-white dark:bg-slate-900 p-6 flex flex-col shadow-sm fixed h-screen">
        <div className="flex items-center gap-4 px-4 py-4 mb-4 bg-[#F1F0FB] dark:bg-slate-800 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-[#E5DEFF] dark:bg-slate-700 flex items-center justify-center">
            <User className="w-5 h-5 text-[#8B5CF6] dark:text-purple-400 stroke-[1.5]" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-sm text-[#1A1F2C] dark:text-slate-200">Användare</h3>
            <p className="text-xs text-[#6E59A5] dark:text-slate-400">Inloggad</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3 mb-6 bg-[#F1F0FB] dark:bg-slate-800 rounded-lg">
          <div className="flex items-center gap-3">
            {isDarkMode ? (
              <Moon className="w-5 h-5 text-[#8B5CF6] dark:text-purple-400 stroke-[1.5]" />
            ) : (
              <Sun className="w-5 h-5 text-[#8B5CF6] dark:text-purple-400 stroke-[1.5]" />
            )}
            <span className="text-sm text-[#1A1F2C] dark:text-slate-200">Mörkt läge</span>
          </div>
          <Switch
            checked={isDarkMode}
            onCheckedChange={toggleDarkMode}
            className="data-[state=checked]:bg-[#8B5CF6]"
          />
        </div>

        <nav className="flex-1 space-y-2">
          <MenuItem icon={LayoutDashboard} label="Översikt" active={true} />
          <MenuItem icon={CheckSquare} label="Checklista" />
          <MenuItem icon={Link} label="Mina länkar" />
        </nav>

        <div className="space-y-2 mb-4">
          <div className="h-px bg-[#E5DEFF] dark:bg-slate-700 my-4" />
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
        </div>

        <div className="border-t border-[#E5DEFF] dark:border-slate-700 pt-4">
          <MenuItem 
            icon={LogOut} 
            label="Logga ut" 
            onClick={handleSignOut}
            className="text-[#D946EF] hover:bg-[#FFDEE2] hover:text-[#D946EF] dark:text-pink-400 dark:hover:bg-pink-900/30 dark:hover:text-pink-400" 
          />
        </div>
      </aside>

      <main className="flex-1 p-8 ml-72">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6 text-[#1A1F2C] dark:text-slate-200">Översikt</h1>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-[#E5DEFF] dark:border-slate-700">
            <p className="text-[#6E59A5] dark:text-slate-400 mb-4">Välkommen till din översikt.</p>
            <Button 
              onClick={handleTestEmail}
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
            >
              Testa e-postfunktionalitet
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
