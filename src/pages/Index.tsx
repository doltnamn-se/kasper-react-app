import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, CheckSquare, Link, LogOut, User, Bell, UserCog, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { TopNav } from "@/components/TopNav";

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
        "hover:bg-black/5 text-[#000000] dark:hover:bg-[#232325] dark:text-gray-300",
        active ? "font-medium" : "",
        className
      )}
    >
      <Icon className="w-5 h-5 transition-transform duration-200 ease-in-out stroke-[1.5] text-[#5e5e5e] dark:text-gray-300" />
      <span className="font-system-ui">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f4f4f4] dark:bg-[#161618] flex transition-colors duration-200">
      <aside className="w-72 border-r border-[#e5e7eb] dark:border-[#232325] bg-white dark:bg-[#1c1c1e] p-6 flex flex-col fixed h-screen transition-colors duration-200">
        <div className="flex items-center gap-4 px-4 py-4 mb-4 rounded-[7px] transition-colors duration-200">
          <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-[#303032] flex items-center justify-center transition-colors duration-200">
            <User className="w-5 h-5 text-[#5e5e5e] dark:text-[#c3caf5] stroke-[1.5]" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-sm text-[#000000] dark:text-gray-300 font-system-ui">{userEmail}</h3>
            <p className="text-xs text-[#000000] dark:text-gray-400 font-system-ui">Inloggad</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3 mb-6 rounded-[7px] transition-colors duration-200">
          <div className="flex items-center gap-3">
            {isDarkMode ? (
              <Moon className="w-5 h-5 text-[#5e5e5e] dark:text-[#c3caf5] stroke-[1.5]" />
            ) : (
              <Sun className="w-5 h-5 text-[#5e5e5e] stroke-[1.5]" />
            )}
            <span className="text-sm text-[#000000] dark:text-gray-300 font-system-ui">Mörkt läge</span>
          </div>
          <Switch
            checked={isDarkMode}
            onCheckedChange={toggleDarkMode}
            className="data-[state=checked]:bg-[#c3caf5] transition-transform duration-[400ms] ease-[cubic-bezier(0.85,0.05,0.18,1.35)]"
          />
        </div>

        <nav className="flex-1 space-y-2">
          <MenuItem icon={LayoutDashboard} label="Översikt" active={true} />
          <MenuItem icon={CheckSquare} label="Checklista" />
          <MenuItem icon={Link} label="Mina länkar" />
        </nav>

        <div className="space-y-2 mb-4">
          <div className="h-px bg-[#e5e7eb] dark:bg-[#232325] my-4 transition-colors duration-200" />
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

        <div className="border-t border-[#e5e7eb] dark:border-[#232325] pt-4 transition-colors duration-200">
          <MenuItem 
            icon={LogOut} 
            label="Logga ut" 
            onClick={handleSignOut}
            className="text-[#ff6369] hover:bg-[#ff22221e] hover:text-[#ff6369] dark:text-[#ff6369] dark:hover:bg-[#ff22221e] dark:hover:text-[#ff6369]" 
          />
        </div>
      </aside>

      <TopNav />

      <main className="flex-1 p-8 ml-72 mt-16">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-[#000000] dark:text-gray-300 mb-6 font-system-ui">Översikt</h1>
          <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[7px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
            <p className="text-[#000000] dark:text-gray-400 mb-4 font-system-ui">Välkommen till din översikt.</p>
            <Button 
              onClick={handleTestEmail}
              className="bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-[#cfcfcf] h-12 px-6 rounded-[4px] font-system-ui transition-colors duration-200"
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