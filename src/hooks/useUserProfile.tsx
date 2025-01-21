import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/customer";
import { toast } from "sonner";

export const useUserProfile = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const initializingRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    let authSubscription: { data: { subscription: { unsubscribe: () => void } } };

    const initUser = async () => {
      // Prevent multiple simultaneous initializations
      if (initializingRef.current) {
        console.log("Already initializing user profile, skipping...");
        return;
      }

      try {
        initializingRef.current = true;
        console.log("Initializing user profile...");
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          if (mounted) {
            setUserEmail(null);
            setUserProfile(null);
          }
          navigate("/auth");
          return;
        }

        if (!session) {
          console.log("No active session found");
          if (mounted) {
            setUserEmail(null);
            setUserProfile(null);
          }
          navigate("/auth");
          return;
        }
        
        if (session?.user?.email && mounted) {
          console.log("Setting user email:", session.user.email);
          setUserEmail(session.user.email);
          
          console.log("Fetching profile for user:", session.user.id);
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select()
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (profileError) {
            console.error("Error fetching profile:", {
              error: profileError,
              userId: session.user.id,
              email: session.user.email
            });
            toast.error("Error loading profile");
          }
          
          if (mounted && profileData) {
            console.log("Profile data fetched successfully:", profileData);
            setUserProfile(profileData);
          }
        }
      } catch (err) {
        console.error("Error in initUser:", err);
        if (mounted) {
          setUserEmail(null);
          setUserProfile(null);
        }
        navigate("/auth");
      } finally {
        if (mounted) {
          initializingRef.current = false;
        }
      }
    };

    // Initial profile load
    initUser();

    // Set up auth state change listener
    authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_OUT') {
        setUserEmail(null);
        setUserProfile(null);
        navigate("/auth");
        return;
      }

      if (event === 'USER_UPDATED' || event === 'SIGNED_IN') {
        await initUser();
      }
    });

    // Cleanup function
    return () => {
      console.log("Cleaning up useUserProfile hook");
      mounted = false;
      initializingRef.current = false;
      authSubscription.data.subscription.unsubscribe();
    };
  }, [navigate]);

  return {
    userEmail,
    userProfile,
    isSigningOut,
    setIsSigningOut
  };
};