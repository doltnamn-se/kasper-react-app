
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { useEffect } from "react";
import { initializeVersionTracking, cleanupVersionTracking } from "@/config/version";
import { isNativePlatform } from "@/capacitor";
import { pushNotificationService } from "@/services/pushNotificationService";
import { splashScreenService } from "@/services/splashScreenService";
import { UserBottomNav } from "@/components/nav/UserBottomNav";
import { AdminBottomNav } from "@/components/nav/AdminBottomNav";
import { TopNav } from "@/components/TopNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUserProfile } from "@/hooks/useUserProfile";

import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import Index from "@/pages/Index";
import Checklist from "@/pages/Checklist";
import Monitoring from "@/pages/Monitoring";
import Deindexing from "@/pages/Deindexing";
import AddressAlerts from "@/pages/AddressAlerts";
import Guides from "@/pages/Guides";
import Settings from "@/pages/Settings";
import PasswordTest from "@/pages/PasswordTest";

// Admin routes
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminVersionLog from "@/pages/admin/AdminVersionLog";
import AdminMonitoring from "@/pages/admin/AdminMonitoring";
import { AdminDeindexingView } from "@/components/deindexing/AdminDeindexingView";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthRoute } from "@/components/auth/AuthRoute";

const queryClient = new QueryClient();

// Create a PersistentLayout component that wraps content with persistent navigation
const PersistentLayout = () => {
  const isMobile = useIsMobile();
  const { userProfile } = useUserProfile();
  const isAdmin = userProfile?.role === 'super_admin';
  const location = useLocation();
  
  return (
    <div className="relative">
      <TopNav />
      <div className="md:ml-72 min-h-screen bg-[#f4f4f4] dark:bg-[#161618] transition-colors duration-200 pb-16 md:pb-0">
        <main className="px-4 md:px-12 pt-12 relative">
          <Outlet />
        </main>
      </div>
      {isMobile && (isAdmin ? <AdminBottomNav /> : <UserBottomNav />)}
    </div>
  );
};

function App() {
  useEffect(() => {
    initializeVersionTracking();
    return () => cleanupVersionTracking();
  }, []);

  // Initialize push notifications for native platforms with error handling
  useEffect(() => {
    const initializePushNotifications = async () => {
      if (isNativePlatform()) {
        try {
          console.log('Initializing push notifications...');
          await pushNotificationService.register();
        } catch (err) {
          console.error('Error initializing push notifications (handled):', err);
        }
      }
    };
    
    // Small delay to ensure app is fully loaded
    setTimeout(() => {
      initializePushNotifications();
    }, 1000);
  }, []);

  // Hide the splash screen after the app is fully loaded and rendered
  useEffect(() => {
    const hideSplashScreen = async () => {
      if (document.readyState === 'complete') {
        console.log('Document ready, hiding splash screen');
        setTimeout(async () => {
          try {
            await splashScreenService.hide();
            console.log('Splash screen hidden successfully');
          } catch (error) {
            console.error('Error hiding splash screen:', error);
          }
        }, 500);
      } else {
        window.addEventListener('load', () => {
          console.log('Window loaded, hiding splash screen');
          setTimeout(async () => {
            try {
              await splashScreenService.hide();
              console.log('Splash screen hidden successfully on window load');
            } catch (error) {
              console.error('Error hiding splash screen on window load:', error);
            }
          }, 500);
        }, { once: true });
      }
    };
    
    hideSplashScreen();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
        <LanguageProvider>
          <SidebarProvider>
            <Router>
              <Routes>
                {/* Auth routes */}
                <Route path="/auth/*" element={<AuthRoute><Auth /></AuthRoute>} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />
                
                {/* Admin routes */}
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="deindexing" element={<AdminDeindexingView />} />
                  <Route path="monitoring" element={<AdminMonitoring />} />
                  <Route path="version-log" element={<AdminVersionLog />} />
                </Route>

                {/* Customer routes with persistent layout */}
                <Route element={<ProtectedRoute customerOnly><PersistentLayout /></ProtectedRoute>}>
                  <Route path="/" element={<Index />} />
                  <Route path="/checklist" element={<Checklist />} />
                  <Route path="/monitoring" element={<Monitoring />} />
                  <Route path="/deindexing" element={<Deindexing />} />
                  <Route path="/address-alerts" element={<AddressAlerts />} />
                  <Route path="/guides" element={<Guides />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
                
                {/* Password test page */}
                <Route path="/password-test" element={<PasswordTest />} />
              </Routes>
              <Toaster />
            </Router>
          </SidebarProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
