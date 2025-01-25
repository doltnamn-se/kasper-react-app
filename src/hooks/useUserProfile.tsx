import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/customer";
import { toast } from "sonner";

export const useUserProfile = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();
  const mounted = useRef(true);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select()
        .eq('id', userId)
        .maybeSingle();
      
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        toast.error("Error loading profile");
        return null;
      }
      
      console.log("Profile data fetched successfully");
      return profileData;
    } catch (err) {
      console.error("Error in fetchUserProfile:", err);
      return null;
    }
  }, []);

  useEffect(() => {
    console.log("useUserProfile: Setting up auth listener");

    const initializeProfile = async (session: any) => {
      if (!mounted.current) return;
      
      try {
        setUserEmail(session?.user?.email ?? null);
        
        if (session?.user?.id) {
          const profileData = await fetchUserProfile(session.user.id);
          if (mounted.current && profileData) {
            setUserProfile(profileData);
          }
        }
        
        setIsInitializing(false);
      } catch (err) {
        console.error("Error in initializeProfile:", err);
        if (mounted.current) {
          setIsInitializing(false);
        }
      }
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session ? "Session found" : "No session");
      initializeProfile(session);
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
            const session = await supabase.auth.getSession();
            const userId = session.data.session?.user?.id;
            if (userId) {
              const updatedProfile = await fetchUserProfile(userId);
              if (mounted.current && updatedProfile) {
                setUserProfile(updatedProfile);
              }
            }
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
          setUserProfile(null);
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
  }, [navigate, fetchUserProfile]);

  return {
    userEmail,
    userProfile,
    isSigningOut,
    setIsSigningOut,
    isInitializing
  };
};