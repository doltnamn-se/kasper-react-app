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

  // Get customer members count
  const { data: membersCount } = useQuery({
    queryKey: ['customer-members-count', userProfile?.id],
    queryFn: async () => {
      if (!userProfile?.id) return 0;
      const { count, error } = await supabase
        .from('customer_members')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', userProfile.id);
      
      if (error) throw error;
      return count || 0;
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
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {language === 'sv' ? 'Namn' : 'Name'}
        </p>
        <p className="font-medium">
          {userProfile?.display_name || '-'}
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Email
        </p>
        <p className="font-medium">
          {userProfile?.email || '-'}
        </p>
      </div>

      <div className="h-px bg-[#e5e7eb] dark:bg-[#232325]" />

      <div className="space-y-1">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {language === 'sv' ? 'Prenumerationstyp' : 'Subscription type'}
        </p>
        <p className="font-medium">
          {getSubscriptionType(subscriptionPlan)}
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {language === 'sv' ? 'Prenumerationslängd' : 'Subscription length'}
        </p>
        <p className="font-medium">
          {getSubscriptionLength(subscriptionPlan)}
        </p>
      </div>

      {showFamilyMembers && (
        <>
          <div className="h-px bg-[#e5e7eb] dark:bg-[#232325]" />
          
          <div className="space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === 'sv' ? 'Familjemedlemmar' : 'Family members'}
            </p>
            <p className="font-medium">
              {membersCount || 0}
            </p>
          </div>
        </>
      )}

      <div className="h-px bg-[#e5e7eb] dark:bg-[#232325]" />

      <div className="space-y-1">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {language === 'sv' ? 'Datum registrerad' : 'Date joined'}
        </p>
        <p className="font-medium">
          {formatDate(userProfile?.created_at)}
        </p>
      </div>

      <div className="h-px bg-[#e5e7eb] dark:bg-[#232325]" />

      <div>
        <a 
          href="https://billing.stripe.com/p/login/eVa4ifayTfS48la7ss"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium"
        >
          {language === 'sv' ? 'Hantera prenumeration' : 'Manage subscription'}
        </a>
      </div>
    </div>
  );
};