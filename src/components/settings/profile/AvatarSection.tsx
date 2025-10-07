import { Profile } from "@/types/customer";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ProfileInfo } from "./ProfileInfo";

interface AvatarSectionProps {
  userProfile: Profile | null;
  onAvatarUpdate: (url: string | null) => void;
}

export const AvatarSection = ({ userProfile }: AvatarSectionProps) => {
  const { data: customerData } = useQuery({
    queryKey: ['customer', userProfile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('subscription_plan')
        .eq('id', userProfile?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.id
  });

  return (
    <div 
      className="rounded-2xl p-6 bg-white dark:bg-[#1c1c1e] border border-[#e5e7eb] dark:border-[#232325]"
    >
      <ProfileInfo 
        userProfile={userProfile}
        subscriptionPlan={customerData?.subscription_plan}
      />
    </div>
  );
};