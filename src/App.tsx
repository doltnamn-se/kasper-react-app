import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminCustomers from "./pages/admin/AdminCustomers";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) => {
  const [session, setSession] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Initial session check error:", error);
          setSession(false);
          return;
        }
        
        if (currentSession) {
          console.log("Initial session check: Authenticated");
          setSession(true);
          
          // Fetch user role from profiles
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentSession.user.id)
            .single();
            
          if (profileError) {
            console.error("Error fetching user role:", profileError);
          } else {
            console.log("User role:", profileData?.role);
            setUserRole(profileData?.role);
          }
        } else {
          console.log("Initial session check: Not authenticated");
          setSession(false);
        }
      } catch (err) {
        console.error("Session initialization failed:", err);
        setSession(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session ? "Authenticated" : "Not authenticated");
      setSession(!!session);
      
      if (session) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setUserRole(profileData?.role);
      }
    });

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  if (session === null || (requiredRole && userRole === null)) {
    console.log("Session or role state is null, waiting for initialization...");
    return null;
  }

  if (!session) {
    console.log("User not authenticated, redirecting to auth");
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    console.log("User doesn't have required role, redirecting to home");
    return <Navigate to="/" replace />;
  }

  console.log("Rendering protected route, session state:", session);
  return children;
};

const AuthRoute = () => {
  const [session, setSession] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(!!currentSession);
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === null) return null;
  return session ? <Navigate to="/" replace /> : <Auth />;
};

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
            <Route path="/admin/customers" element={
              <ProtectedRoute requiredRole="super_admin">
                <SidebarProvider>
                  <AdminCustomers />
                </SidebarProvider>
              </ProtectedRoute>
            } />
            <Route path="/auth" element={<AuthRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;