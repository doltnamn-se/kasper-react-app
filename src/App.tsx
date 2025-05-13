
import React, { Suspense, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Index from "./pages/Index";
import Monitoring from "./pages/Monitoring";
import Deindexing from "./pages/Deindexing";
import AddressAlerts from "./pages/AddressAlerts";
import Guides from "./pages/Guides";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import Admin from "./pages/admin/AdminLayout"; // Fixed import
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "./contexts/LanguageContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import { MobileProvider } from "./contexts/MobileContext"; // This context needs to be created
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { MobilePersistentLayout } from "./components/layout/MobilePersistentLayout";
import { useIsMobile } from './hooks/use-mobile';
import { ScrollToTop } from './components/ScrollToTop'; // Will need to be created
import { AuthLayout } from './components/layout/AuthLayout'; // Will need to be created
import { Terms } from './pages/Terms'; // Will need to be created
import { Privacy } from './pages/Privacy'; // Will need to be created
import { Pricing } from './pages/Pricing'; // Will need to be created
import { Support } from './pages/Support'; // Will need to be created
import { AdminProtectedRoute } from './components/auth/AdminProtectedRoute'; // Will need to be created
import { Toaster } from 'sonner'; // Fixed import
import ProfilePage from "./pages/ProfilePage";

const queryClient = new QueryClient();

function App() {
  const isMobile = useIsMobile();

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <SidebarProvider>
            <MobileProvider>
              <Toaster />
              <ScrollToTop />
              <Routes>
                <Route path="/auth" element={
                  <AuthLayout>
                    <Auth />
                  </AuthLayout>
                } />
                <Route path="/terms" element={
                  <AuthLayout>
                    <Terms />
                  </AuthLayout>
                } />
                <Route path="/privacy" element={
                  <AuthLayout>
                    <Privacy />
                  </AuthLayout>
                } />
                <Route path="/pricing" element={
                  <AuthLayout>
                    <Pricing />
                  </AuthLayout>
                } />
                <Route path="/support" element={
                  <AuthLayout>
                    <Support />
                  </AuthLayout>
                } />
                
                <Route path="/" element={
                  <ProtectedRoute>
                    <MobilePersistentLayout>
                      <Index />
                    </MobilePersistentLayout>
                  </ProtectedRoute>
                } />
                <Route path="/monitoring" element={
                  <ProtectedRoute>
                    <MobilePersistentLayout>
                      <Monitoring />
                    </MobilePersistentLayout>
                  </ProtectedRoute>
                } />
                <Route path="/deindexing" element={
                  <ProtectedRoute>
                    <MobilePersistentLayout>
                      <Deindexing />
                    </MobilePersistentLayout>
                  </ProtectedRoute>
                } />
                <Route path="/address-alerts" element={
                  <ProtectedRoute>
                    <MobilePersistentLayout>
                      <AddressAlerts />
                    </MobilePersistentLayout>
                  </ProtectedRoute>
                } />
                <Route path="/guides" element={
                  <ProtectedRoute>
                    <MobilePersistentLayout>
                      <Guides />
                    </MobilePersistentLayout>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <MobilePersistentLayout>
                      <Settings />
                    </MobilePersistentLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <AdminProtectedRoute>
                    <MobilePersistentLayout>
                      <Admin />
                    </MobilePersistentLayout>
                  </AdminProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <MobilePersistentLayout>
                      <ProfilePage />
                    </MobilePersistentLayout>
                  </ProtectedRoute>
                } />
              </Routes>
            </MobileProvider>
          </SidebarProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
