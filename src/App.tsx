
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
import { MobilePersistentLayout } from "@/components/layout/MobilePersistentLayout";
import { MobileIntroRedirect } from "@/components/routing/MobileIntroRedirect";
import { supabase } from "@/integrations/supabase/client";

import Auth from "@/pages/Auth";
import Intro from "@/pages/Intro";
import ResetPassword from "@/pages/ResetPassword";
import Index from "@/pages/Index";
import Checklist from "@/pages/Checklist";
import Completion from "@/pages/Completion";
import Monitoring from "@/pages/Monitoring";
import Deindexing from "@/pages/Deindexing";
import AddressAlerts from "@/pages/AddressAlerts";
import Guides from "@/pages/Guides";
import KasperFriends from "@/pages/KasperFriends";
import Settings from "@/pages/Settings";
import Chat from "@/pages/Chat";
import ProfileMenu from "@/pages/ProfileMenu";


// Admin routes
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminVersionLog from "@/pages/admin/AdminVersionLog";
import AdminMonitoring from "@/pages/admin/AdminMonitoring";
import AdminPromotionalCodes from "@/pages/admin/AdminPromotionalCodes";
import AdminChat from "@/pages/admin/AdminChat";
import { AdminDeindexingView } from "@/components/deindexing/AdminDeindexingView";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthRoute } from "@/components/auth/AuthRoute";

const queryClient = new QueryClient();

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

  // Listen for auth state changes to manage push notification tokens
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        console.log('User signed out, clearing device tokens');
        pushNotificationService.clearTokens();
      } else if (event === 'SIGNED_IN' && session) {
        console.log('User signed in, checking/fixing device tokens');
        // Fix any token mismatches on login
        setTimeout(() => {
          pushNotificationService.fixTokenMismatch();
        }, 2000); // Wait a bit to ensure the token is registered first
      }
    });
    
    return () => subscription.unsubscribe();
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
              <MobileIntroRedirect />
              <Routes>
                {/* Intro/Onboarding route for iOS */}
                <Route path="/intro" element={<Intro />} />
                
                {/* Auth routes */}
                <Route path="/auth/*" element={<AuthRoute><Auth /></AuthRoute>} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />
                <Route path="/completion" element={<Completion />} />
                
                {/* Admin routes */}
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="deindexing" element={<AdminDeindexingView />} />
                  <Route path="monitoring" element={<AdminMonitoring />} />
                  <Route path="promotional-codes" element={<AdminPromotionalCodes />} />
                  <Route path="chat" element={<AdminChat />} />
                  <Route path="version-log" element={<AdminVersionLog />} />
                </Route>

                {/* Customer routes wrapped with MobilePersistentLayout for mobile persistence */}
                <Route element={<MobilePersistentLayout />}>
                  <Route path="/" element={<ProtectedRoute customerOnly><Index /></ProtectedRoute>} />
                  <Route path="/checklist" element={<ProtectedRoute customerOnly><Checklist /></ProtectedRoute>} />
                  <Route path="/monitoring" element={<ProtectedRoute customerOnly><Monitoring /></ProtectedRoute>} />
                  <Route path="/deindexing" element={<ProtectedRoute customerOnly><Deindexing /></ProtectedRoute>} />
                  <Route path="/address-alerts" element={<ProtectedRoute customerOnly><AddressAlerts /></ProtectedRoute>} />
                  <Route path="/guides" element={<ProtectedRoute customerOnly><Guides /></ProtectedRoute>} />
                  <Route path="/kasper-friends" element={<ProtectedRoute customerOnly><KasperFriends /></ProtectedRoute>} />
                  <Route path="/chat" element={<ProtectedRoute customerOnly><Chat /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute customerOnly><Settings /></ProtectedRoute>} />
                  <Route path="/profile-menu" element={<ProtectedRoute customerOnly><ProfileMenu /></ProtectedRoute>} />
                </Route>
                
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
