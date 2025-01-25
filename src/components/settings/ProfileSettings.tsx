import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getUserInitials } from "@/utils/profileUtils";

export const ProfileSettings = () => {
  const { t } = useLanguage();
  const { userProfile, userEmail } = useUserProfile();
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('error.invalidFileType'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('error.fileTooLarge'));
      return;
    }

    try {
      setIsUploading(true);
      
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${userProfile?.id}/${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userProfile?.id);

      if (updateError) {
        throw updateError;
      }

      toast.success(t('success.avatarUpdated'));
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error(t('error.avatarUpload'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage src={userProfile?.avatar_url || undefined} />
            <AvatarFallback className="text-lg">
              {getUserInitials(userProfile)}
            </AvatarFallback>
          </Avatar>
          <Label 
            htmlFor="avatar-upload" 
            className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-primary dark:hover:bg-primary/90 dark:text-[#000000] rounded-full p-1.5 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <Input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={isUploading}
            />
          </Label>
        </div>
        <div>
          <h3 className="text-lg font-medium">{userProfile?.display_name || userEmail}</h3>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            type="email"
            value={userEmail || ''}
            disabled
            className="bg-muted"
          />
        </div>
        
        <div>
          <Label htmlFor="display_name">{t('display.name')}</Label>
          <Input
            id="display_name"
            type="text"
            value={userProfile?.display_name || ''}
            disabled
            className="bg-muted"
          />
        </div>
      </div>
    </div>
  );
};