import { Profile } from "@/types/customer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

interface ProfileInfoProps {
  userProfile: Profile | null;
  subscriptionPlan: string | null;
}

export const ProfileInfo = ({ userProfile, subscriptionPlan }: ProfileInfoProps) => {
  const { t, language } = useLanguage();

  // Get customer members
  const { data: members } = useQuery({
    queryKey: ['customer-members', userProfile?.id],
    queryFn: async () => {
      if (!userProfile?.id) return [];
      const { data, error } = await supabase
        .from('customer_members')
        .select('display_name')
        .eq('customer_id', userProfile.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userProfile?.id
  });

  const getSubscriptionType = (plan: string | null) => {
    if (!plan) return '-';
    if (plan.includes('personskydd')) return 'Personskydd';
    if (plan.includes('parskydd')) return 'Pärskydd';
    if (plan.includes('familjeskydd')) return 'Familjeskydd';
    return '-';
  };

  const getSubscriptionLength = (plan: string | null) => {
    if (!plan) return '-';
    if (plan.includes('1_year')) return language === 'sv' ? '1 år' : '1 year';
    if (plan.includes('2_years')) return language === 'sv' ? '2 år' : '2 years';
    if (plan.includes('12_months')) return language === 'sv' ? '1 år' : '1 year';
    if (plan.includes('24_months')) return language === 'sv' ? '2 år' : '2 years';
    return '-';
  };

  const showFamilyMembers = subscriptionPlan?.includes('parskydd') || subscriptionPlan?.includes('familjeskydd');

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'PPP', { locale: language === 'sv' ? sv : undefined });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-[0.8rem] md:text-[0.9rem] text-[#121212] dark:text-[#FFFFFF]">
          {language === 'sv' ? 'Namn' : 'Name'}
        </p>
        <p className="font-medium text-[0.9rem] md:text-[1rem] text-[#121212] dark:text-[#FFFFFF]">
          {userProfile?.display_name || '-'}
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-[0.8rem] md:text-[0.9rem] text-[#121212] dark:text-[#FFFFFF]">
          Email
        </p>
        <p className="font-medium text-[0.9rem] md:text-[1rem] text-[#121212] dark:text-[#FFFFFF]">
          {userProfile?.email || '-'}
        </p>
      </div>

      <div className="h-px bg-[#e5e7eb] dark:bg-[#232325]" />

      <div className="space-y-1">
        <p className="text-[0.8rem] md:text-[0.9rem] text-[#121212] dark:text-[#FFFFFF]">
          {language === 'sv' ? 'Prenumerationstyp' : 'Subscription type'}
        </p>
        <p className="font-medium text-[0.9rem] md:text-[1rem] text-[#121212] dark:text-[#FFFFFF]">
          {getSubscriptionType(subscriptionPlan)}
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-[0.8rem] md:text-[0.9rem] text-[#121212] dark:text-[#FFFFFF]">
          {language === 'sv' ? 'Prenumerationslängd' : 'Subscription length'}
        </p>
        <p className="font-medium text-[0.9rem] md:text-[1rem] text-[#121212] dark:text-[#FFFFFF]">
          {getSubscriptionLength(subscriptionPlan)}
        </p>
      </div>

      {showFamilyMembers && (
        <>
          <div className="h-px bg-[#e5e7eb] dark:bg-[#232325]" />
          
          <div className="space-y-1">
            <p className="text-[0.8rem] md:text-[0.9rem] text-[#121212] dark:text-[#FFFFFF]">
              {language === 'sv' ? 'Familjemedlemmar' : 'Family members'}
            </p>
            <div className="font-medium text-[0.9rem] md:text-[1rem] text-[#121212] dark:text-[#FFFFFF]">
              {members && members.length > 0 ? (
                members.map((member, index) => (
                  <div key={index}>{member.display_name}</div>
                ))
              ) : (
                <p>-</p>
              )}
            </div>
          </div>
        </>
      )}

      <div className="h-px bg-[#e5e7eb] dark:bg-[#232325]" />

      <div className="space-y-1">
        <p className="text-[0.8rem] md:text-[0.9rem] text-[#121212] dark:text-[#FFFFFF]">
          {language === 'sv' ? 'Datum registrerad' : 'Date joined'}
        </p>
        <p className="font-medium text-[0.9rem] md:text-[1rem] text-[#121212] dark:text-[#FFFFFF]">
          {formatDate(userProfile?.created_at)}
        </p>
      </div>

      <div className="h-px bg-[#e5e7eb] dark:bg-[#232325]" />

      <div>
        <a 
          href="https://billing.stripe.com/p/login/eVa4ifayTfS48la7ss"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium text-[0.9rem] md:text-[1rem]"
        >
          {language === 'sv' ? 'Hantera prenumeration' : 'Manage subscription'}
        </a>
      </div>
    </div>
  );
};