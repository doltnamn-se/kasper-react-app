import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Profile } from "@/types/customer";
import { getUserInitials } from "@/utils/profileUtils";
import { Upload } from "lucide-react";

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
      console.log("Uploading avatar...");

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

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userProfile?.id);

      if (updateError) {
        console.error("Error updating profile with avatar URL:", updateError);
        throw updateError;
      }

      onAvatarUpdate(publicUrl);
      toast.success(t('success'));
    } catch (error) {
      console.error("Avatar upload failed:", error);
      toast.error(t('error.generic'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarDelete = async () => {
    try {
      console.log("Deleting avatar...");

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userProfile?.id);

      if (updateError) {
        console.error("Error removing avatar URL:", updateError);
        throw updateError;
      }

      onAvatarUpdate(null);
      toast.success(t('success'));
    } catch (error) {
      console.error("Avatar deletion failed:", error);
      toast.error(t('error.generic'));
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src={userProfile?.avatar_url || undefined} />
        <AvatarFallback>{getUserInitials(userProfile)}</AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Button
            variant="outline"
            className="bg-[#f4f4f4] hover:bg-[#e4e4e4] border-0 dark:bg-[#2a2a2b] dark:hover:bg-[#3a3a3b]"
            disabled={isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {t('upload')}
          </Button>
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleAvatarUpload}
            accept="image/*"
            disabled={isUploading}
            aria-label={t('upload')}
          />
        </div>
        {userProfile?.avatar_url && (
          <Button
            variant="ghost"
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