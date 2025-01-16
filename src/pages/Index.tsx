import { Library, ListTodo, Link2, Users, Shield } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { AuthLogo } from "@/components/auth/AuthLogo";
import { APP_VERSION } from "@/config/version";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const Index = () => {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setUserRole(profile?.role);
      }
    };

    fetchUserRole();
  }, []);

  return (
    <>
      <div className="bg-white dark:bg-[#1c1c1e] border-r border-[#e5e7eb] dark:border-[#232325] w-72 h-screen fixed left-0">
        <div className="px-8 py-6">
          <AuthLogo className="relative h-8" />
        </div>

        <div className="h-px bg-[#e5e7eb] dark:bg-[#232325] mx-6 mb-8 transition-colors duration-200" />

        <div className="px-6">
          <nav>
            <Link to="/" className="flex items-center gap-3 mb-3 px-5 py-2.5 rounded-md bg-gray-100 dark:bg-gray-800">
              <Library className="w-[18px] h-[18px] text-[#5b5b59] dark:text-gray-300" />
              <span className="text-sm text-black dark:text-gray-300">Översikt</span>
            </Link>

            <Link to="#" className="flex items-center gap-3 mb-3 px-5 py-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
              <ListTodo className="w-[18px] h-[18px] text-[#5b5b59] dark:text-gray-300" />
              <span className="text-sm text-black dark:text-gray-300">Checklista</span>
            </Link>

            <Link to="#" className="flex items-center gap-3 mb-3 px-5 py-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
              <Link2 className="w-[18px] h-[18px] text-[#5b5b59] dark:text-gray-300" />
              <span className="text-sm text-black dark:text-gray-300">Mina länkar</span>
            </Link>

            {userRole === 'super_admin' && (
              <Link 
                to="/admin/customers" 
                className="flex items-center gap-3 px-5 py-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Shield className="w-[18px] h-[18px] text-[#5b5b59] dark:text-gray-300" />
                <span className="text-sm text-black dark:text-gray-300">Admin Dashboard</span>
              </Link>
            )}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-6 py-4 flex justify-between items-center">
          <LanguageSwitch />
          <span className="text-xs text-[#5e5e5e] dark:text-gray-400">v{APP_VERSION}</span>
        </div>
      </div>

      <div className="ml-72 min-h-screen bg-[#f4f4f4] dark:bg-[#161618] transition-colors duration-200">
        <TopNav />
        
        <main className="px-8 pt-24">
          <div className="max-w-5xl px-8">
            <h1 className="text-2xl font-bold text-[#000000] dark:text-gray-300 mb-6 font-system-ui">Översikt</h1>
            <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[7px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
              <p className="text-[#000000] dark:text-gray-400 mb-4 font-system-ui">Välkommen till din översikt.</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Index;