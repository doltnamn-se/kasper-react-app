
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck } from "lucide-react";
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
      {progressPercentage === 100 && (
        <div className="absolute bottom-0 right-0 bg-white dark:bg-[#1e1e1e] rounded-full p-1">
          <BadgeCheck className="w-4 h-4 text-blue-500" />
        </div>
      )}
    </div>
  );
};
