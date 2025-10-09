
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/customer";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export const useUserProfile = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();
  const mounted = useRef(true);

  const { data: userProfile, refetch: refetchProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return null;

      console.log("Fetching profile for user:", session.user.id);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')  // Using select(*) ensures all fields including mrkoll_removal_checked_at are fetched
        .eq('id', session.user.id)
        .maybeSingle();
      
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        toast.error("Error loading profile");
        return null;
      }
      
      // Also fetch customer data to get subscription plan, customer type, and company info
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select(`
          subscription_plan, 
          customer_type,
          company:companies(name)
        `)
        .eq('id', session.user.id)
        .maybeSingle();
        
      if (customerError) {
        console.error("Error fetching customer data:", customerError);
      }
      
      console.log("Profile data fetched successfully", profileData);
      console.log("Avatar URL:", profileData?.avatar_url);
      console.log("Subscription plan:", customerData?.subscription_plan);
      console.log("Customer type:", customerData?.customer_type);
      console.log("Company data:", customerData?.company);
      
      // Combine profile data with subscription plan, customer type, and company info
      return {
        ...profileData,
        subscription_plan: customerData?.subscription_plan,
        customer_type: customerData?.customer_type,
        company_name: (customerData?.company as any)?.name
      };
    },
    enabled: true
  });

  useEffect(() => {
    console.log("useUserProfile: Setting up auth listener");

    const initializeProfile = async (session: any) => {
      if (!mounted.current) return;
      
      try {
        console.log("[Auth] Initializing profile with session:", session ? "exists" : "null");
        setUserEmail(session?.user?.email ?? null);
        if (session?.user?.id) {
          console.log("[Auth] Fetching profile for user:", session.user.id);
          await refetchProfile();
        }
        console.log("[Auth] Profile initialization complete");
        setIsInitializing(false);
      } catch (err) {
        console.error("[Auth] Error in initializeProfile:", err);
        if (mounted.current) {
          setIsInitializing(false);
        }
      }
    };

    // Initial session check with timeout
    console.log("[Auth] Starting initial session check");
    const sessionCheckTimeout = setTimeout(() => {
      console.error("[Auth] Session check timed out after 5 seconds, proceeding without session");
      if (mounted.current) {
        setUserEmail(null);
        setIsInitializing(false);
      }
    }, 5000);

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        clearTimeout(sessionCheckTimeout);
        console.log("[Auth] Initial session check complete:", session ? "Session found" : "No session");
        initializeProfile(session);
      })
      .catch((error) => {
        clearTimeout(sessionCheckTimeout);
        console.error("[Auth] Error getting session:", error);
        if (mounted.current) {
          setIsInitializing(false);
        }
      });

    // Set up real-time subscription for profile changes
    const channel = supabase.channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        async (payload) => {
          console.log('Profile changed:', payload);
          if (mounted.current) {
            await refetchProfile();
          }
        }
      )
      .subscribe();

    // Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_OUT') {
        if (mounted.current) {
          setUserEmail(null);
          setIsInitializing(false);
          navigate("/auth");
        }
        return;
      }

      if (event === 'SIGNED_IN') {
        initializeProfile(session);
      }
    });

    return () => {
      console.log("Cleaning up useUserProfile hook");
      mounted.current = false;
      subscription.unsubscribe();
      channel.unsubscribe();
    };
  }, [navigate, refetchProfile]);

  return {
    userEmail,
    userProfile,
    isSigningOut,
    setIsSigningOut,
    isInitializing
  };
};
