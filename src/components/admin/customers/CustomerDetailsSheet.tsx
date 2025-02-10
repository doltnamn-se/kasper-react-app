
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { CustomerWithProfile } from "@/types/customer";
import { format, formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserInitials } from "@/utils/profileUtils";
import { BadgeCheck, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SubscriptionBadge } from "@/components/settings/profile/SubscriptionBadge";
import { useCustomerPresence } from "./useCustomerPresence";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface CustomerDetailsSheetProps {
  customer: CustomerWithProfile | null;
  onOpenChange: (open: boolean) => void;
}

export const CustomerDetailsSheet = ({ customer, onOpenChange }: CustomerDetailsSheetProps) => {
  const { onlineUsers, lastSeen } = useCustomerPresence();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  // Fetch customer's URLs and URL limits
  const { data: customerData } = useQuery({
    queryKey: ['customer-data', customer?.id],
    queryFn: async () => {
      if (!customer?.id) return { urls: [], limits: null };
      
      const [urlsResponse, limitsResponse] = await Promise.all([
        supabase.from('removal_urls').select('*').eq('customer_id', customer.id),
        supabase.from('user_url_limits').select('*').eq('customer_id', customer.id).single()
      ]);

      return {
        urls: urlsResponse.data || [],
        limits: limitsResponse.data
      };
    },
    enabled: !!customer?.id
  });

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('toast.copied.title'),
      description: `${label} ${t('toast.copied.description')}`
    });
  };

  if (!customer) return null;

  const isOnline = customer.id ? onlineUsers.has(customer.id) : false;
  const userLastSeen = customer.id ? lastSeen[customer.id] : null;

  const capitalizedCustomerType = customer.customer_type.charAt(0).toUpperCase() + customer.customer_type.slice(1);

  // Calculate URL usage
  const usedUrls = customerData?.urls?.length || 0;
  const baseUrlLimit = 3; // Base limit for all users
  const additionalUrls = customerData?.limits?.additional_urls || 0;
  const totalUrlLimit = baseUrlLimit + additionalUrls;

  return (
    <Sheet open={!!customer} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md w-full px-0">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="px-6 space-y-6">
            <div className="flex flex-col items-center text-center pt-6">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white dark:border-[#1e1e1e]">
                  <AvatarImage src={customer.profile?.avatar_url} />
                  <AvatarFallback className="bg-[#e8e8e8] dark:bg-[#303032] text-[#5e5e5e] dark:text-[#FFFFFFA6] text-2xl">
                    {getUserInitials(customer.profile)}
                  </AvatarFallback>
                </Avatar>
                {customer.onboarding_completed && (
                  <div className="absolute bottom-0 right-0 bg-white dark:bg-[#1e1e1e] rounded-full p-1">
                    <BadgeCheck className="w-5 h-5 text-blue-500" />
                  </div>
                )}
              </div>
              
              <div className="mt-4 space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-2xl font-semibold text-[#000000] dark:text-white">
                    {customer.profile?.display_name || t('no.name')}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopy(customer.profile?.display_name || '', t('name'))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-sm text-[#000000A6] dark:text-[#FFFFFFA6]">
                    {customer.profile?.email || t('no.email')}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopy(customer.profile?.email || '', t('email'))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Customer Type & Subscription Tags */}
            <div className="flex gap-2 justify-center flex-wrap">
              <Badge 
                variant="secondary"
                className="bg-badge-subscription-bg dark:bg-badge-subscription-bg-dark text-badge-subscription-text hover:bg-badge-subscription-bg dark:hover:bg-badge-subscription-bg-dark py-1.5"
              >
                {capitalizedCustomerType}
              </Badge>
              <SubscriptionBadge plan={customer.subscription_plan} />
            </div>
          </div>

          {/* Details Sections */}
          <div className="border-t border-[#eaeaea] dark:border-[#2e2e2e]">
            <div className="px-6 py-4 space-y-6">
              {/* Account Details */}
              <div>
                <h3 className="text-base font-medium text-[#000000] dark:text-[#FFFFFFA6] mb-3">
                  {t('account.details')}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-[#000000] dark:text-[#FFFFFFA6]">{t('customer.id')}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#000000A6] dark:text-[#FFFFFFA6]">{customer.id}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopy(customer.id, t('customer.id'))}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs font-medium flex justify-between">
                    <span className="text-[#000000] dark:text-[#FFFFFFA6]">{t('created')}</span>
                    <span className="text-[#000000A6] dark:text-[#FFFFFFA6]">
                      {customer.created_at ? format(new Date(customer.created_at), 'PPP') : t('not.available')}
                    </span>
                  </p>
                  <p className="text-xs font-medium flex justify-between">
                    <span className="text-[#000000] dark:text-[#FFFFFFA6]">{t('status')}</span>
                    <span className="text-[#000000A6] dark:text-[#FFFFFFA6]">
                      {isOnline ? t('online') : t('offline')}
                    </span>
                  </p>
                  {!isOnline && userLastSeen && (
                    <p className="text-xs font-medium flex justify-between">
                      <span className="text-[#000000] dark:text-[#FFFFFFA6]">{t('last.seen')}</span>
                      <span className="text-[#000000A6] dark:text-[#FFFFFFA6]">
                        {formatDistanceToNow(new Date(userLastSeen), { addSuffix: true })}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* URLs Section */}
              <div>
                <h3 className="text-base font-medium text-[#000000] dark:text-[#FFFFFFA6] mb-3">
                  {t('url.submissions')}
                </h3>
                <div className="space-y-2">
                  <p className="text-xs font-medium flex justify-between">
                    <span className="text-[#000000] dark:text-[#FFFFFFA6]">{t('total.urls')}</span>
                    <span className="text-[#000000A6] dark:text-[#FFFFFFA6]">
                      {usedUrls}
                    </span>
                  </p>
                  <p className="text-xs font-medium flex justify-between">
                    <span className="text-[#000000] dark:text-[#FFFFFFA6]">{t('urls.available')}</span>
                    <span className="text-[#000000A6] dark:text-[#FFFFFFA6]">
                      {usedUrls} / {totalUrlLimit}
                    </span>
                  </p>
                </div>
              </div>

              {/* Onboarding Status */}
              <div>
                <h3 className="text-base font-medium text-[#000000] dark:text-[#FFFFFFA6] mb-3">
                  {t('onboarding.status')}
                </h3>
                <div className="space-y-2">
                  <p className="text-xs font-medium flex justify-between">
                    <span className="text-[#000000] dark:text-[#FFFFFFA6]">{t('status')}</span>
                    <span className="text-[#000000A6] dark:text-[#FFFFFFA6]">
                      {customer.onboarding_completed ? t('completed') : t('in.progress')}
                    </span>
                  </p>
                  {!customer.onboarding_completed && (
                    <p className="text-xs font-medium flex justify-between">
                      <span className="text-[#000000] dark:text-[#FFFFFFA6]">{t('current.step')}</span>
                      <span className="text-[#000000A6] dark:text-[#FFFFFFA6]">{customer.onboarding_step || 1}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
