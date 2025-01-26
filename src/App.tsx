import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Routes, Route } from "react-router-dom";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Checklist from "@/pages/Checklist";
import Settings from "@/pages/Settings";
import Deindexing from "@/pages/Deindexing";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import PasswordTest from "@/pages/PasswordTest";
import AddressAlerts from "@/pages/AddressAlerts";
import Guides from "@/pages/Guides";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthRoute } from "@/components/auth/AuthRoute";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <LanguageProvider>
          <SidebarProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/checklist" element={<ProtectedRoute><Checklist /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/deindexing" element={<ProtectedRoute><Deindexing /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/password-test" element={<ProtectedRoute><PasswordTest /></ProtectedRoute>} />
                <Route path="/address-alerts" element={<ProtectedRoute><AddressAlerts /></ProtectedRoute>} />
                <Route path="/guides" element={<ProtectedRoute><Guides /></ProtectedRoute>} />
              </Routes>
              <Toaster />
            </BrowserRouter>
          </SidebarProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;