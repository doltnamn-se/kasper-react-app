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
  const initializingRef = useRef(false);
  const mountedRef = useRef(true);
  const navigate = useNavigate();

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

  const refetchProfile = useCallback(async () => {
    if (!mountedRef.current) {
      console.log("Skipping refetch - component unmounted");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const profileData = await fetchUserProfile(session.user.id);
        if (mountedRef.current && profileData) {
          setUserProfile(profileData);
          setUserEmail(session.user.email);
        }
      }
    } catch (err) {
      console.error("Error in refetchProfile:", err);
    }
  }, [fetchUserProfile]);

  const initUser = useCallback(async () => {
    if (!mountedRef.current || initializingRef.current) {
      return;
    }

    try {
      initializingRef.current = true;
      setIsInitializing(true);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        navigate("/auth");
        return;
      }

      if (!session) {
        console.log("No active session found");
        navigate("/auth");
        return;
      }
      
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        const profileData = await fetchUserProfile(session.user.id);
        if (mountedRef.current && profileData) {
          setUserProfile(profileData);
        }
      }
    } catch (err) {
      console.error("Error in initUser:", err);
      navigate("/auth");
    } finally {
      if (mountedRef.current) {
        initializingRef.current = false;
        setIsInitializing(false);
      }
    }
  }, [navigate, fetchUserProfile]);

  useEffect(() => {
    mountedRef.current = true;
    initUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (!mountedRef.current) return;
      
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

    return () => {
      console.log("Cleaning up useUserProfile hook");
      mountedRef.current = false;
      initializingRef.current = false;
      subscription.unsubscribe();
    };
  }, [initUser, navigate]);

  return {
    userEmail,
    userProfile,
    isSigningOut,
    setIsSigningOut,
    refetchProfile,
    isInitializing
  };
};