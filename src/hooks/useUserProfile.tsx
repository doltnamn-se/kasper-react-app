import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/customer";
import { toast } from "sonner";

export const useUserProfile = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const initUser = async () => {
      try {
        console.log("[useUserProfile] Initializing user profile...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("[useUserProfile] Session error:", sessionError);
          if (mounted) {
            setUserEmail(null);
            setUserProfile(null);
          }
          navigate("/auth");
          return;
        }

        if (!session) {
          console.log("[useUserProfile] No active session found");
          if (mounted) {
            setUserEmail(null);
            setUserProfile(null);
          }
          navigate("/auth");
          return;
        }
        
        if (session?.user?.email && mounted) {
          console.log("[useUserProfile] Setting user email:", session.user.email);
          setUserEmail(session.user.email);
          
          console.log("[useUserProfile] Fetching profile for user:", {
            userId: session.user.id,
            email: session.user.email
          });

          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) {
            console.error("[useUserProfile] Error fetching profile:", {
              error: profileError,
              userId: session.user.id,
              email: session.user.email,
              statusCode: profileError.code,
              details: profileError.details,
              message: profileError.message
            });
            toast.error("Failed to load user profile");
            return;
          }
          
          if (mounted && profileData) {
            console.log("[useUserProfile] Profile data fetched successfully:", profileData);
            setUserProfile(profileData);
          } else {
            console.warn("[useUserProfile] No profile data returned for user:", session.user.id);
          }
        }
      } catch (err) {
        console.error("[useUserProfile] Unexpected error in initUser:", err);
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
      
      console.log("[useUserProfile] Auth state changed:", event);
      
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
          .select('*')
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