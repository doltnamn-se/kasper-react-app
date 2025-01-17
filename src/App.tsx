import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthRoute } from "@/components/auth/AuthRoute";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AdminCustomers from "./pages/admin/AdminCustomers";
import { OnboardingLayout } from "./pages/onboarding/OnboardingLayout";
import { SetPassword } from "./pages/onboarding/SetPassword";
import { HidingPreferences } from "./pages/onboarding/HidingPreferences";
import { RemovalUrls } from "./pages/onboarding/RemovalUrls";
import { IdentificationInfo } from "./pages/onboarding/IdentificationInfo";
import { OnboardingComplete } from "./pages/onboarding/OnboardingComplete";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <Index />
                </SidebarProvider>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <Profile />
                </SidebarProvider>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <Settings />
                </SidebarProvider>
              </ProtectedRoute>
            } />
            <Route path="/admin/customers" element={
              <ProtectedRoute requiredRole="super_admin">
                <SidebarProvider>
                  <AdminCustomers />
                </SidebarProvider>
              </ProtectedRoute>
            } />
            <Route path="/onboarding" element={<OnboardingLayout />}>
              <Route index element={<SetPassword />} />
              <Route path="set-password" element={<SetPassword />} />
              <Route path="hiding-preferences" element={<HidingPreferences />} />
              <Route path="removal-urls" element={<RemovalUrls />} />
              <Route path="identification" element={<IdentificationInfo />} />
              <Route path="complete" element={<OnboardingComplete />} />
            </Route>
            <Route path="/auth" element={<AuthRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;