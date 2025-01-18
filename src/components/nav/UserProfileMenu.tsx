import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Settings, UserCircle, CreditCard, LogOut } from "lucide-react";

export const UserProfileMenu = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ first_name?: string; last_name?: string } | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

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
            .select('first_name, last_name')
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
          .select('first_name, last_name')
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

  const handleSignOut = async () => {
    if (isSigningOut) {
      console.log("Sign out already in progress");
      return;
    }

    try {
      setIsSigningOut(true);
      console.log("Attempting to sign out...");
      
      setUserEmail(null);
      setUserProfile(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error);
        toast({
          variant: "destructive",
          title: t('toast.error.title'),
          description: t('toast.error.description'),
          className: "top-4 right-4",
        });
        return;
      }
      
      console.log("Sign out successful");
      
      navigate("/auth", { replace: true });
      
      toast({
        title: t('toast.signed.out.title'),
        description: t('toast.signed.out.description'),
        className: "top-4 right-4",
      });
    } catch (err) {
      console.error("Unexpected error during sign out:", err);
      toast({
        variant: "destructive",
        title: t('toast.error.title'),
        description: t('toast.error.unexpected'),
        className: "top-4 right-4",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  const getUserInitials = () => {
    if (!userProfile?.first_name && !userProfile?.last_name) return 'U';
    return `${userProfile.first_name?.[0] || ''}${userProfile.last_name?.[0] || ''}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 text-[#000000] dark:text-gray-300 hover:bg-black/5 dark:hover:bg-[#232325] ml-2"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-black/5 dark:bg-[#303032] text-[#5e5e5e] dark:text-gray-400 text-sm">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{userEmail}</span>
          <ChevronDown className="w-4 h-4 text-[#5e5e5e] dark:text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-3">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate("/profile")} className="py-2 cursor-pointer">
            <UserCircle className="mr-3 h-4 w-4" />
            <span className="text-black dark:text-gray-300">{t('profile.manage')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="py-2 cursor-pointer"
            onClick={() => window.open('https://billing.stripe.com/p/login/eVa4ifayTfS48la7ss', '_blank')}
          >
            <CreditCard className="mr-3 h-4 w-4" />
            <span className="text-black dark:text-gray-300">{t('profile.billing')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/settings")} className="py-2 cursor-pointer">
            <Settings className="mr-3 h-4 w-4" />
            <span className="text-black dark:text-gray-300">{t('profile.settings')}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="mx-[-12px] my-2" />
        <DropdownMenuItem 
          onClick={handleSignOut} 
          disabled={isSigningOut}
          className="py-2 cursor-pointer"
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span className="text-black dark:text-gray-300">
            {isSigningOut ? t('profile.signing.out') : t('profile.sign.out')}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};