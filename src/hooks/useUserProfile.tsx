import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type UserProfile = {
  first_name?: string;
  last_name?: string;
  display_name?: string;
};

export const useUserProfile = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const initUser = async () => {
      try {
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
          
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('first_name, last_name, display_name')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) {
            console.error("Error fetching profile:", profileError);
          }
          
          if (mounted && profileData) {
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
          .select('first_name, last_name, display_name')
          .eq('id', session.user.id)
          .single();
        
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