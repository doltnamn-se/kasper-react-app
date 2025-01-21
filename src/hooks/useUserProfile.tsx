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
  const initialized = useRef(false);

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
      
      console.log("Profile data fetched successfully:", profileData);
      return profileData;
    } catch (err) {
      console.error("Error in fetchUserProfile:", err);
      return null;
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    console.log("useUserProfile: Initial setup");
    let mounted = true;

    const initializeProfile = async () => {
      try {
        console.log("Initializing profile...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          if (mounted) {
            setIsInitializing(false);
          }
          return;
        }

        if (!session?.user) {
          console.log("No active session");
          if (mounted) {
            setIsInitializing(false);
          }
          return;
        }

        if (mounted) {
          console.log("Setting up initial profile data");
          setUserEmail(session.user.email);
          const profileData = await fetchUserProfile(session.user.id);
          if (mounted && profileData) {
            setUserProfile(profileData);
          }
          setIsInitializing(false);
        }
      } catch (err) {
        console.error("Error in initializeProfile:", err);
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    // Initial profile load
    initializeProfile();

    // Set up real-time subscription for profile changes
    const channel = supabase.channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${supabase.auth.getSession().then(({ data }) => data.session?.user?.id)}`
        },
        async (payload) => {
          console.log('Profile changed:', payload);
          if (mounted) {
            const session = await supabase.auth.getSession();
            const userId = session.data.session?.user?.id;
            if (userId) {
              const updatedProfile = await fetchUserProfile(userId);
              if (mounted && updatedProfile) {
                setUserProfile(updatedProfile);
              }
            }
          }
        }
      )
      .subscribe();

    // Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_OUT') {
        setUserEmail(null);
        setUserProfile(null);
        setIsInitializing(false);
        navigate("/auth");
        return;
      }

      if (event === 'SIGNED_IN' && session?.user) {
        setUserEmail(session.user.email);
        const profileData = await fetchUserProfile(session.user.id);
        if (mounted && profileData) {
          setUserProfile(profileData);
        }
        setIsInitializing(false);
      }
    });

    return () => {
      console.log("Cleaning up useUserProfile hook");
      mounted = false;
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