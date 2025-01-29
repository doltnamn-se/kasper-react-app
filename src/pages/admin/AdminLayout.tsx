import { Outlet } from "react-router-dom";
import { AdminNavigation } from "@/components/nav/AdminNavigation";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-[#f4f4f4] dark:bg-[#161618]">
      <div className="flex">
        {/* Admin Sidebar */}
        <div className="hidden md:block w-64 min-h-screen bg-white dark:bg-[#1c1c1e] border-r border-[#e5e7eb] dark:border-[#232325]">
          <div className="p-6">
            <h1 className="text-xl font-bold text-black dark:text-white">Admin Dashboard</h1>
          </div>
          <AdminNavigation toggleMobileMenu={() => {}} />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <main className="p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;