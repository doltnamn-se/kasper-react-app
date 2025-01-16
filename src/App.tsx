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

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Immediately check the current session
    const checkSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session check error:", error);
          setSession(false);
          return;
        }
        console.log("Initial session check:", currentSession ? "Authenticated" : "Not authenticated");
        setSession(!!currentSession);
      } catch (err) {
        console.error("Session check failed:", err);
        setSession(false);
      }
    };

    checkSession();

    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session ? "Authenticated" : "Not authenticated");
      
      if (event === 'SIGNED_OUT') {
        setSession(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Refresh the session when signed in or token refreshed
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (!error && currentSession) {
          setSession(true);
        } else {
          console.error("Failed to get session after auth state change:", error);
          setSession(false);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Show nothing while checking authentication
  if (session === null) {
    return null;
  }

  return session ? <>{children}</> : <Navigate to="/auth" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <Index />
                  </SidebarProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;