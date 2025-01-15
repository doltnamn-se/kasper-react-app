import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, CheckSquare, Link, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const MenuItem = ({ 
    icon: Icon, 
    label, 
    onClick, 
    className 
  }: { 
    icon: any; 
    label: string; 
    onClick?: () => void;
    className?: string;
  }) => (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors rounded-lg",
        className
      )}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white p-4 flex flex-col">
        {/* User Profile Section */}
        <div className="flex items-center gap-3 px-4 py-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <div className="flex-1">
            <h3 className="font-medium text-sm">Användare</h3>
            <p className="text-xs text-gray-500">Inloggad</p>
          </div>
        </div>

        {/* Main Menu */}
        <nav className="flex-1 space-y-1">
          <MenuItem icon={LayoutDashboard} label="Översikt" />
          <MenuItem icon={CheckSquare} label="Checklista" />
          <MenuItem icon={Link} label="Mina länkar" />
        </nav>

        {/* Bottom Section */}
        <div className="border-t pt-4 mt-4">
          <MenuItem 
            icon={LogOut} 
            label="Logga ut" 
            onClick={handleSignOut}
            className="text-red-600 hover:bg-red-50" 
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-semibold mb-6">Översikt</h1>
        <p className="text-gray-600">Välkommen till din översikt.</p>
      </main>
    </div>
  );
};

export default Index;