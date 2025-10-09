import { Profile } from "@/types/customer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { ArrowUpDown } from "lucide-react";

interface ProfileInfoProps {
  userProfile: Profile | null;
  subscriptionPlan: string | null;
  customerType?: string | null;
  companyName?: string | null;
}

export const ProfileInfo = ({ userProfile, subscriptionPlan, customerType, companyName }: ProfileInfoProps) => {
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
    // Old plans (1_month, 3_months, etc.) are always Personskydd
    if (plan.includes('_month') || plan.includes('_year')) return 'Personskydd';
    // New plans
    if (plan.includes('personskydd')) return 'Personskydd';
    if (plan.includes('parskydd')) return 'Pärskydd';
    if (plan.includes('familjeskydd')) return 'Familjeskydd';
    return '-';
  };

  const getSubscriptionLength = (plan: string | null) => {
    if (!plan) return '-';
    // Handle old plan formats
    if (plan.includes('1_month')) return language === 'sv' ? '1 mån' : '1 month';
    if (plan.includes('3_months')) return language === 'sv' ? '3 mån' : '3 months';
    if (plan.includes('6_months')) return language === 'sv' ? '6 mån' : '6 months';
    if (plan.includes('12_months')) return language === 'sv' ? '12 mån' : '12 months';
    if (plan.includes('24_months')) return language === 'sv' ? '24 mån' : '24 months';
    // Handle new plan formats
    if (plan.includes('1_year')) return language === 'sv' ? '1 år' : '1 year';
    if (plan.includes('2_years')) return language === 'sv' ? '2 år' : '2 years';
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
        <p className="text-[0.8rem] font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
          {language === 'sv' ? 'Namn' : 'Name'}
        </p>
        <p className="font-medium text-[0.9rem] text-[#121212] dark:text-[#FFFFFF]">
          {userProfile?.display_name || '-'}
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-[0.8rem] font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
          Email
        </p>
        <p className="font-medium text-[0.9rem] text-[#121212] dark:text-[#FFFFFF]">
          {userProfile?.email || '-'}
        </p>
      </div>

      <div className="h-px bg-[#e5e7eb] dark:bg-[#232325]" />

      <div className="space-y-1">
        <p className="text-[0.8rem] font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
          {language === 'sv' ? 'Prenumerationstyp' : 'Subscription type'}
        </p>
        <p className="font-medium text-[0.9rem] text-[#121212] dark:text-[#FFFFFF]">
          {getSubscriptionType(subscriptionPlan)}
        </p>
      </div>

      {customerType === 'business' ? (
        <>
          <div className="space-y-1">
            <p className="text-[0.8rem] font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
              {t('customer.type')}
            </p>
            <p className="font-medium text-[0.9rem] text-[#121212] dark:text-[#FFFFFF]">
              {t('business.client')}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[0.8rem] font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
              {t('company.name')}
            </p>
            <p className="font-medium text-[0.9rem] text-[#121212] dark:text-[#FFFFFF]">
              {companyName || '-'}
            </p>
          </div>
        </>
      ) : (
        <div className="space-y-1">
          <p className="text-[0.8rem] font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
            {language === 'sv' ? 'Prenumerationslängd' : 'Subscription length'}
          </p>
          <p className="font-medium text-[0.9rem] text-[#121212] dark:text-[#FFFFFF]">
            {getSubscriptionLength(subscriptionPlan)}
          </p>
        </div>
      )}

      {showFamilyMembers && (
        <>
          <div className="h-px bg-[#e5e7eb] dark:bg-[#232325]" />
          
          <div className="space-y-1">
            <p className="text-[0.8rem] font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
              {language === 'sv' ? 'Familjemedlemmar' : 'Family members'}
            </p>
            <div className="font-medium text-[0.9rem] text-[#121212] dark:text-[#FFFFFF]">
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
        <p className="text-[0.8rem] font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
          {language === 'sv' ? 'Datum registrerad' : 'Date joined'}
        </p>
        <p className="font-medium text-[0.9rem] text-[#121212] dark:text-[#FFFFFF]">
          {formatDate(userProfile?.created_at)}
        </p>
      </div>

      <div className="h-px bg-[#e5e7eb] dark:bg-[#232325]" />

      <div>
        <a 
          href="https://billing.stripe.com/p/login/eVa4ifayTfS48la7ss"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#121212] dark:bg-[#FFFFFF] text-[#FFFFFF] dark:text-[#121212] hover:opacity-90 transition-opacity font-medium text-[0.9rem]"
        >
          <ArrowUpDown size={16} />
          {language === 'sv' ? 'Byt plan' : 'Switch plan'}
        </a>
      </div>
    </div>
  );
};