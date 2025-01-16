import { LayoutDashboard, CheckSquare, Link } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { AuthLogo } from "@/components/auth/AuthLogo";
import { APP_VERSION } from "@/config/version";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";

const Index = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-[#f4f4f4] dark:bg-[#161618] flex transition-colors duration-200">
        <Sidebar variant="inset" className="bg-white dark:bg-[#1c1c1e] border-r border-[#e5e7eb] dark:border-[#232325]">
          <SidebarHeader className="px-8 py-6">
            <AuthLogo className="relative h-8" />
          </SidebarHeader>

          <div className="h-px bg-[#e5e7eb] dark:bg-[#232325] mx-6 mb-8 transition-colors duration-200" />

          <SidebarContent className="px-6">
            <SidebarMenu>
              <SidebarMenuButton
                isActive={true}
                tooltip="Översikt"
                className="mb-3"
              >
                <LayoutDashboard className="w-4 h-4 text-[#5e5e5e] dark:text-gray-300" />
                <span>Översikt</span>
              </SidebarMenuButton>

              <SidebarMenuButton
                tooltip="Checklista"
                className="mb-3"
              >
                <CheckSquare className="w-4 h-4 text-[#5e5e5e] dark:text-gray-300" />
                <span>Checklista</span>
              </SidebarMenuButton>

              <SidebarMenuButton
                tooltip="Mina länkar"
              >
                <Link className="w-4 h-4 text-[#5e5e5e] dark:text-gray-300" />
                <span>Mina länkar</span>
              </SidebarMenuButton>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="px-6 py-4">
            <span className="text-xs text-[#5e5e5e] dark:text-gray-400">v{APP_VERSION}</span>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        <TopNav />

        <main className="flex-1 p-8 pt-24">
          <div className="max-w-5xl">
            <h1 className="text-2xl font-bold text-[#000000] dark:text-gray-300 mb-6 font-system-ui">Översikt</h1>
            <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[7px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
              <p className="text-[#000000] dark:text-gray-400 mb-4 font-system-ui">Välkommen till din översikt.</p>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;