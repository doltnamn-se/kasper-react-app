import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserInitials } from "@/utils/profileUtils";
import { Separator } from "@/components/ui/separator";
import { Profile } from "@/types/customer";

interface ProfileSectionProps {
  userProfile: Profile | null;
  userEmail: string | undefined;
}

export const ProfileSection = ({ userProfile, userEmail }: ProfileSectionProps) => {
  // Split display name into parts
  const displayName = userProfile?.display_name || userEmail || '';
  const nameParts = displayName.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userProfile?.avatar_url} />
            <AvatarFallback className="bg-[#e8e8e8] dark:bg-[#303032] text-[#5e5e5e] dark:text-[#FFFFFFA6]">
              {getUserInitials(userProfile)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[#000000] dark:text-white leading-tight">
              {firstName}
            </span>
            {lastName && (
              <span className="text-sm font-medium text-[#000000] dark:text-white leading-tight">
                {lastName}
              </span>
            )}
          </div>
        </div>
      </div>
      <Separator className="mb-6 bg-[#e5e7eb] dark:bg-[#2d2d2d]" />
    </div>
  );
};