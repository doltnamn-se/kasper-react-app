import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Checklist from "./pages/Checklist";
import MyLinks from "./pages/MyLinks";
import AddressAlerts from "./pages/AddressAlerts";
import Guides from "./pages/Guides";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthRoute } from "./components/auth/AuthRoute";
import { Toaster } from "./components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "./contexts/LanguageContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import { OnboardingLayout } from "./pages/onboarding/OnboardingLayout";
import { HidingPreferences } from "./pages/onboarding/HidingPreferences";
import { RemovalUrls } from "./pages/onboarding/RemovalUrls";
import { IdentificationInfo } from "./pages/onboarding/IdentificationInfo";
import { OnboardingComplete } from "./pages/onboarding/OnboardingComplete";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <SidebarProvider>
          <Router>
            <Routes>
              {/* Auth routes */}
              <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
              <Route path="/auth/reset-password" element={<AuthRoute><Auth /></AuthRoute>} />
              
              {/* Onboarding Routes - No protection wrapper */}
              <Route path="/onboarding" element={<OnboardingLayout />}>
                <Route path="/onboarding/hiding-preferences" element={<HidingPreferences />} />
                <Route path="/onboarding/removal-urls" element={<RemovalUrls />} />
                <Route path="/onboarding/identification" element={<IdentificationInfo />} />
                <Route path="/onboarding/complete" element={<OnboardingComplete />} />
                <Route index element={<HidingPreferences />} />
              </Route>

              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/customers" element={<ProtectedRoute><AdminCustomers /></ProtectedRoute>} />
              <Route path="/checklist" element={<ProtectedRoute><Checklist /></ProtectedRoute>} />
              <Route path="/my-links" element={<ProtectedRoute><MyLinks /></ProtectedRoute>} />
              <Route path="/address-alerts" element={<ProtectedRoute><AddressAlerts /></ProtectedRoute>} />
              <Route path="/guides" element={<ProtectedRoute><Guides /></ProtectedRoute>} />
            </Routes>
            <Toaster />
          </Router>
        </SidebarProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;