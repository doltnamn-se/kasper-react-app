import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/customer";

export const useUserProfile = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const initUser = async () => {
      try {
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
      }
    };

    initUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_OUT') {
        setUserEmail(null);
        setUserProfile(null);
        navigate("/auth");
        return;
      }

      if (session?.user?.email) {
        setUserEmail(session.user.email);
        const { data: profileData } = await supabase
          .from('profiles')
          .select()
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (mounted && profileData) {
          setUserProfile(profileData);
        }
      }
    });

    return () => {
      mounted = false;
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