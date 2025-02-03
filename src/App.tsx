import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { initializeVersionTracking, cleanupVersionTracking } from "@/config/version";

import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import Index from "@/pages/Index";
import Checklist from "@/pages/Checklist";
import Monitoring from "@/pages/Monitoring";
import Guides from "@/pages/Guides";
import Settings from "@/pages/Settings";
import Deindexing from "@/pages/Deindexing";
import AddressAlerts from "@/pages/AddressAlerts";

// Admin pages
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminCustomers from "@/pages/admin/AdminCustomers";

import { AuthRoute } from "@/components/auth/AuthRoute";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function App() {
  useEffect(() => {
    initializeVersionTracking();
    return () => cleanupVersionTracking();
  }, []);

  return (
    <LanguageProvider>
      <div className="min-h-screen">
        <div className="flex min-h-screen">
          <SidebarProvider>
            <Router>
              <Routes>
                {/* Auth routes */}
                <Route path="/auth/*" element={<AuthRoute><Auth /></AuthRoute>} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />
                
                {/* Admin routes */}
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="customers" element={<AdminCustomers />} />
                </Route>

                {/* Protected routes */}
                <Route element={<ProtectedRoute><Index /></ProtectedRoute>}>
                  <Route path="/checklist" element={<Checklist />} />
                  <Route path="/monitoring" element={<Monitoring />} />
                  <Route path="/guides" element={<Guides />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/deindexing" element={<Deindexing />} />
                  <Route path="/address-alerts" element={<AddressAlerts />} />
                </Route>
              </Routes>
            </Router>
          </SidebarProvider>
        </div>
        <Toaster />
      </div>
    </LanguageProvider>
  );
}

export default App;
