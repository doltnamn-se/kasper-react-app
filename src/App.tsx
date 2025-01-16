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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (currentSession) {
          console.log("Initial session check: Authenticated");
          setSession(true);
          
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', currentSession.user.id)
              .maybeSingle();
              
            if (profileError) {
              console.error("Error fetching user role:", profileError);
            } else if (profileData) {
              console.log("User role:", profileData.role);
              setUserRole(profileData.role);
            } else {
              console.log("No profile found for user");
              setUserRole(null);
            }
          } catch (profileErr) {
            console.error("Unexpected error fetching profile:", profileErr);
          }
        } else {
          console.log("Initial session check: Not authenticated");
          setSession(false);
          setUserRole(null);
        }
      } catch (err) {
        console.error("Session initialization failed:", err);
        if (mounted) {
          setSession(false);
          setUserRole(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session ? "Authenticated" : "Not authenticated");
      
      if (!mounted) return;

      setIsLoading(true);

      if (session) {
        setSession(true);
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (profileError) {
            console.error("Error fetching user role on auth change:", profileError);
          } else if (profileData) {
            console.log("Updated user role:", profileData.role);
            setUserRole(profileData.role);
          } else {
            console.log("No profile found for user on auth change");
            setUserRole(null);
          }
        } catch (err) {
          console.error("Error updating user role:", err);
        }
      } else {
        setSession(false);
        setUserRole(null);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    console.log("Loading authentication state...");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (!session) {
    console.log("User not authenticated, redirecting to auth");
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    console.log(`User doesn't have required role (${requiredRole}), current role: ${userRole}`);
    return <Navigate to="/" replace />;
  }

  return children;
};

const AuthRoute = () => {
  const [session, setSession] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(!!currentSession);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(!!session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

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