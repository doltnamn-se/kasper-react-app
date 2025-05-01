
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CustomerWithProfile } from "@/types/customer";
import { getUserInitials } from "@/utils/profileUtils";

interface CustomerAvatarProps {
  customer: CustomerWithProfile;
  progressPercentage: number;
}

export const CustomerAvatar = ({ customer, progressPercentage }: CustomerAvatarProps) => {
  return (
    <div className="relative">
      <Avatar className="h-16 w-16">
        <AvatarImage src={customer.profile?.avatar_url} />
        <AvatarFallback className="bg-[#e8e8e8] dark:bg-[#303032] text-[#5e5e5e] dark:text-[#FFFFFFA6] text-lg">
          {getUserInitials(customer.profile)}
        </AvatarFallback>
      </Avatar>
      {/* Removed the checkmark badge that was here */}
    </div>
  );
};
