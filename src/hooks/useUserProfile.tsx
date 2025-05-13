
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUserProfile = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsInitializing(false);
        return null;
      }

      setUserEmail(session.user.email);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setIsInitializing(false);
        return null;
      }

      setIsInitializing(false);
      return data;
    },
    // Replace onSettled with meta.onSettled, which is the correct property
    meta: {
      onSettled: () => {
        setIsInitializing(false);
      }
    }
  });

  // Provide a properly structured userProfile object that components expect
  const userProfile = profile || null;

  return { 
    profile,
    userProfile, // Add this to maintain compatibility
    userEmail,
    isInitializing,
    isLoading,
    isSigningOut,
    setIsSigningOut
  };
};
