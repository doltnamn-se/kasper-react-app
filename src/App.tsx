
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import { MainLayout } from "@/components/layout/MainLayout";
import { MobilePersistentLayout } from "@/components/layout/MobilePersistentLayout";
import { useIsMobile } from "@/hooks/use-mobile";

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

// Wrapper component to choose the right layout based on device type
const AppLayoutWrapper = ({ children }) => {
  const isMobile = useIsMobile();
  console.log("AppLayoutWrapper rendering, isMobile:", isMobile);
  
  // Always render content, but with the appropriate layout
  return isMobile ? (
    <MobilePersistentLayout>{children}</MobilePersistentLayout>
  ) : (
    <MainLayout>{children}</MainLayout>
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
          // Silently handle errors to prevent app crashes
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
      // Wait for DOM to be fully ready
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
        // If document not ready yet, wait for load event
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

                {/* User routes with responsive layout */}
                <Route path="/" element={
                  <ProtectedRoute customerOnly>
                    <AppLayoutWrapper>
                      <Index />
                    </AppLayoutWrapper>
                  </ProtectedRoute>
                } />
                <Route path="/checklist" element={
                  <ProtectedRoute customerOnly>
                    <AppLayoutWrapper>
                      <Checklist />
                    </AppLayoutWrapper>
                  </ProtectedRoute>
                } />
                <Route path="/monitoring" element={
                  <ProtectedRoute customerOnly>
                    <AppLayoutWrapper>
                      <Monitoring />
                    </AppLayoutWrapper>
                  </ProtectedRoute>
                } />
                <Route path="/deindexing" element={
                  <ProtectedRoute customerOnly>
                    <AppLayoutWrapper>
                      <Deindexing />
                    </AppLayoutWrapper>
                  </ProtectedRoute>
                } />
                <Route path="/address-alerts" element={
                  <ProtectedRoute customerOnly>
                    <AppLayoutWrapper>
                      <AddressAlerts />
                    </AppLayoutWrapper>
                  </ProtectedRoute>
                } />
                <Route path="/guides" element={
                  <ProtectedRoute customerOnly>
                    <AppLayoutWrapper>
                      <Guides />
                    </AppLayoutWrapper>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute customerOnly>
                    <AppLayoutWrapper>
                      <Settings />
                    </AppLayoutWrapper>
                  </ProtectedRoute>
                } />
                
                {/* Non-wrapped routes */}
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
