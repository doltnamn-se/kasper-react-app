import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Checking session:", session ? "Authenticated" : "Not authenticated");
      setSession(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session ? "Authenticated" : "Not authenticated");
      setSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === null) {
    return null; // Loading state
  }

  return session ? <>{children}</> : <Navigate to="/auth" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <div className="min-h-screen flex w-full">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;