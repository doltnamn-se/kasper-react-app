import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { useEffect } from "react";
import { initializeVersionTracking, cleanupVersionTracking } from "@/config/version";

import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Checklist from "@/pages/Checklist";
import Deindexing from "@/pages/Deindexing";
import AddressAlerts from "@/pages/AddressAlerts";
import Guides from "@/pages/Guides";
import Settings from "@/pages/Settings";
import PasswordTest from "@/pages/PasswordTest";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthRoute } from "@/components/auth/AuthRoute";

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    initializeVersionTracking();
    return () => cleanupVersionTracking();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SidebarProvider>
            <Router>
              <Routes>
                <Route path="/auth/*" element={<AuthRoute><Auth /></AuthRoute>} />
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/checklist" element={<ProtectedRoute><Checklist /></ProtectedRoute>} />
                <Route path="/deindexing" element={<ProtectedRoute><Deindexing /></ProtectedRoute>} />
                <Route path="/address-alerts" element={<ProtectedRoute><AddressAlerts /></ProtectedRoute>} />
                <Route path="/guides" element={<ProtectedRoute><Guides /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/password-test" element={<PasswordTest />} />
              </Routes>
              <Toaster />
            </Router>
          </SidebarProvider>
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;