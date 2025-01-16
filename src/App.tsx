import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "@/components/ui/use-toast";
import Index from "./pages/Index";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<boolean | null>(null);
  const { data: isSubscribed, isLoading: isCheckingSubscription, error } = useSubscription();

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

  useEffect(() => {
    if (error) {
      console.error("Subscription check error:", error);
      toast({
        title: "Error",
        description: "Failed to verify subscription status. Please try again later.",
        variant: "destructive",
      });
    }
  }, [error]);

  if (session === null || isCheckingSubscription) {
    return null; // Loading state
  }

  // If authenticated but not subscribed, show subscription required message
  if (session && !isSubscribed && !isCheckingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md p-6 text-center space-y-4">
          <h2 className="text-2xl font-semibold">Subscription Required</h2>
          <p className="text-muted-foreground">
            Please subscribe to access this content.
          </p>
          <button
            onClick={() => window.location.href = '/auth'}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
          >
            Go to Subscription
          </button>
        </div>
      </div>
    );
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
                  <Index />
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