
import { Badge } from "@/components/ui/badge";
import { SubscriptionBadge } from "@/components/settings/profile/SubscriptionBadge";
import { CustomerWithProfile } from "@/types/customer";

interface CustomerBadgesProps {
  customer: CustomerWithProfile;
}

export const CustomerBadges = ({ customer }: CustomerBadgesProps) => {
  const capitalizedCustomerType = customer.customer_type.charAt(0).toUpperCase() + customer.customer_type.slice(1);

  return (
    <div className="flex gap-2 justify-center flex-wrap">
      <Badge 
        variant="secondary"
        className="bg-badge-subscription-bg dark:bg-badge-subscription-bg-dark text-[#000000] dark:text-white hover:bg-badge-subscription-bg dark:hover:bg-badge-subscription-bg-dark py-1.5"
      >
        {capitalizedCustomerType}
      </Badge>
      <SubscriptionBadge plan={customer.subscription_plan} />
    </div>
  );
};
