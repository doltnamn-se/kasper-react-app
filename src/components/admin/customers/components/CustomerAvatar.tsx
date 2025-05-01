
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CustomerWithProfile } from "@/types/customer";
import { getUserInitials } from "@/utils/profileUtils";

interface CustomerAvatarProps {
  customer: CustomerWithProfile;
  size?: "sm" | "md" | "lg";
  progressPercentage?: number;
}

export const CustomerAvatar = ({ customer, size = "md", progressPercentage }: CustomerAvatarProps) => {
  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };
  
  return (
    <div className="relative">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={customer.profile?.avatar_url} />
        <AvatarFallback className="bg-[#e8e8e8] dark:bg-[#303032] text-[#5e5e5e] dark:text-[#FFFFFFA6] text-lg">
          {getUserInitials(customer.profile)}
        </AvatarFallback>
      </Avatar>
      {/* Removed the checkmark badge that was here */}
    </div>
  );
};
