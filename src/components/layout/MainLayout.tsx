import { TopNav } from "@/components/TopNav";
import { AuthLogo } from "@/components/auth/AuthLogo";
import { APP_VERSION } from "@/config/version";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { LayoutDashboard, Library, ListTodo, Link2, Sparkle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <div className="bg-white dark:bg-[#1c1c1e] border-r border-[#e5e7eb] dark:border-[#232325] w-72 h-screen fixed left-0">
        <div className="px-8 py-6">
          <AuthLogo className="relative h-8" />
        </div>

        <div className="h-px bg-[#e5e7eb] dark:bg-[#232325] mx-6 mb-8 transition-colors duration-200" />

        <div className="px-6">
          <nav>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className={`flex items-center gap-3 mb-3 px-5 py-2.5 rounded-md w-full text-left ${
                    location.pathname.startsWith("/admin") 
                      ? "bg-gray-100 dark:bg-gray-800" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Sparkle className="w-[18px] h-[18px] text-[#5b5b59] dark:text-gray-300" />
                  <span className="text-sm text-black dark:text-gray-300">Admin</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start" sideOffset={8}>
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => navigate("/admin/customers")}>
                    Customers
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-px bg-[#e5e7eb] dark:bg-[#232325] mx-2 my-4 transition-colors duration-200" />

            <Link 
              to="/" 
              className={`flex items-center gap-3 mb-3 px-5 py-2.5 rounded-md ${
                location.pathname === "/" 
                  ? "bg-gray-100 dark:bg-gray-800" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <LayoutDashboard className="w-[18px] h-[18px] text-[#5b5b59] dark:text-gray-300" />
              <span className="text-sm text-black dark:text-gray-300">Översikt</span>
            </Link>

            <Link 
              to="#" 
              className="flex items-center gap-3 mb-3 px-5 py-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ListTodo className="w-[18px] h-[18px] text-[#5b5b59] dark:text-gray-300" />
              <span className="text-sm text-black dark:text-gray-300">Checklista</span>
            </Link>

            <Link 
              to="#" 
              className="flex items-center gap-3 mb-3 px-5 py-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Link2 className="w-[18px] h-[18px] text-[#5b5b59] dark:text-gray-300" />
              <span className="text-sm text-black dark:text-gray-300">Mina länkar</span>
            </Link>
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
            {children}
          </div>
        </main>
      </div>
    </>
  );
};