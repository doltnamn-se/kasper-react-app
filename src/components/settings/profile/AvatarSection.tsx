import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getUserInitials } from "@/utils/profileUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Profile } from "@/types/customer";

interface AvatarSectionProps {
  userProfile: Profile | null;
  onAvatarUpdate: (url: string | null) => void;
}

export const AvatarSection = ({ userProfile, onAvatarUpdate }: AvatarSectionProps) => {
  const { t } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      console.log("Starting avatar upload...");

      const fileExt = file.name.split('.').pop();
      const filePath = `${userProfile?.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading avatar:", uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log("Avatar uploaded successfully, updating profile...");

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userProfile?.id);

      if (updateError) {
        console.error("Error updating profile with new avatar:", updateError);
        throw updateError;
      }

      onAvatarUpdate(publicUrl);
      toast.success(t('success.avatarUpdated'));
    } catch (error) {
      console.error("Avatar upload failed:", error);
      toast.error(t('error.generic'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarDelete = async () => {
    try {
      if (!userProfile?.avatar_url) return;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userProfile.id);

      if (updateError) {
        console.error("Error removing avatar from profile:", updateError);
        throw updateError;
      }

      onAvatarUpdate(null);
      toast.success(t('success.avatarDeleted'));
    } catch (error) {
      console.error("Avatar deletion failed:", error);
      toast.error(t('error.avatarDelete'));
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={userProfile?.avatar_url ?? undefined} />
        <AvatarFallback className="bg-black/5 dark:bg-[#303032] text-[#5e5e5e] dark:text-[#FFFFFFA6]">
          {getUserInitials(userProfile)}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-2">
        <div>
          <Button
            variant="outline"
            size="sm"
            className="relative"
            disabled={isUploading}
          >
            {isUploading ? t('loading') : t('profile.upload.photo')}
            <input
              type="file"
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={isUploading}
            />
          </Button>
        </div>
        {userProfile?.avatar_url && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAvatarDelete}
            className="text-red-500 hover:text-red-600 hover:bg-transparent p-0"
          >
            {t('delete')}
          </Button>
        )}
      </div>
    </div>
  );
};