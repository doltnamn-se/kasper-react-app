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
  const mountedRef = useRef(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Setting up useUserProfile effect");
    mountedRef.current = true;

    const initUser = async () => {
      if (!mountedRef.current || initializingRef.current) {
        console.log("Skipping initialization - component unmounted or already initializing");
        return;
      }

      try {
        initializingRef.current = true;
        console.log("Starting user profile initialization...");
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          if (mountedRef.current) {
            setUserEmail(null);
            setUserProfile(null);
          }
          navigate("/auth");
          return;
        }

        if (!session) {
          console.log("No active session found");
          if (mountedRef.current) {
            setUserEmail(null);
            setUserProfile(null);
          }
          navigate("/auth");
          return;
        }
        
        if (session?.user?.email && mountedRef.current) {
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
          
          if (mountedRef.current && profileData) {
            console.log("Profile data fetched successfully:", profileData);
            setUserProfile(profileData);
          }
        }
      } catch (err) {
        console.error("Error in initUser:", err);
        if (mountedRef.current) {
          setUserEmail(null);
          setUserProfile(null);
        }
        navigate("/auth");
      } finally {
        if (mountedRef.current) {
          initializingRef.current = false;
          console.log("User profile initialization completed");
        }
      }
    };

    // Initial profile load
    initUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (!mountedRef.current) {
        console.log("Ignoring auth state change - component unmounted");
        return;
      }
      
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, clearing profile data");
        setUserEmail(null);
        setUserProfile(null);
        navigate("/auth");
        return;
      }

      if (event === 'USER_UPDATED' || event === 'SIGNED_IN') {
        console.log("User updated or signed in, reinitializing profile");
        await initUser();
      }
    });

    // Cleanup function
    return () => {
      console.log("Cleaning up useUserProfile hook");
      mountedRef.current = false;
      initializingRef.current = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  return {
    userEmail,
    userProfile,
    isSigningOut,
    setIsSigningOut
  };
};