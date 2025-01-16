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
    // Initialize session state
    const initSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Initial session check error:", error);
          setSession(false);
          return;
        }
        console.log("Initial session check:", currentSession ? "Authenticated" : "Not authenticated");
        setSession(!!currentSession);
      } catch (err) {
        console.error("Session initialization failed:", err);
        setSession(false);
      }
    };

    initSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session ? "Authenticated" : "Not authenticated");
      
      switch (event) {
        case 'SIGNED_OUT':
          console.log("User signed out");
          setSession(false);
          break;
        
        case 'SIGNED_IN':
        case 'TOKEN_REFRESHED':
          console.log("Session update event received");
          try {
            const { data: { session: currentSession }, error } = await supabase.auth.getSession();
            if (!error && currentSession) {
              console.log("Session updated successfully");
              setSession(true);
            } else {
              console.error("Failed to update session:", error);
              setSession(false);
            }
          } catch (err) {
            console.error("Session update failed:", err);
            setSession(false);
          }
          break;

        default:
          console.log("Unhandled auth event:", event);
      }
    });

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  // Show nothing while checking authentication
  if (session === null) {
    console.log("Session state is null, waiting for initialization...");
    return null;
  }

  console.log("Rendering protected route, session state:", session);
  return session ? <>{children}</> : <Navigate to="/auth" replace />;
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
            <Route path="/auth" element={<AuthRoute />} />
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