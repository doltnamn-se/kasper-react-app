import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getUserInitials } from "@/utils/profileUtils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ProfileSettings = () => {
  const { t } = useLanguage();
  const { userProfile, userEmail } = useUserProfile();
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const { data: customerData } = useQuery({
    queryKey: ['customer', userProfile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('subscription_plan')
        .eq('id', userProfile?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.id
  });

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('error.invalidFileType'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('error.fileTooLarge'));
      return;
    }

    try {
      setIsUploading(true);
      console.log('Starting avatar upload...');
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${userProfile?.id}/${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
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
        throw updateError;
      }

      // Invalidate all profile-related queries
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      await queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      console.log('Avatar updated successfully');
      
      toast.success(t('success.avatarUpdated'));
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error(t('error.avatarUpload'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!userProfile?.avatar_url) return;

    try {
      setIsDeleting(true);
      console.log('Starting avatar deletion...');

      const urlParts = userProfile.avatar_url.split('/');
      const filePath = urlParts.slice(-2).join('/');

      const { error: deleteStorageError } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (deleteStorageError) {
        throw deleteStorageError;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userProfile.id);

      if (updateError) {
        throw updateError;
      }

      // Invalidate all profile-related queries
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      await queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      console.log('Avatar deleted successfully');
      
      toast.success(t('success.avatarDeleted'));
    } catch (error) {
      console.error('Error deleting avatar:', error);
      toast.error(t('error.avatarDelete'));
    } finally {
      setIsDeleting(false);
    }
  };

  const getSubscriptionLabel = (plan: string | null) => {
    switch(plan) {
      case '1_month':
        return t('subscription.1month');
      case '6_months':
        return t('subscription.6months');
      case '12_months':
        return t('subscription.12months');
      default:
        return t('subscription.none');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-8">
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage src={userProfile?.avatar_url || undefined} />
            <AvatarFallback className="text-lg font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
              {getUserInitials(userProfile)}
            </AvatarFallback>
          </Avatar>
          {userProfile?.avatar_url && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 p-0 hover:bg-transparent"
              onClick={handleDeleteAvatar}
              disabled={isDeleting}
            >
              <X className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
            </Button>
          )}
          <Label 
            htmlFor="avatar-upload" 
            className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm text-primary hover:text-primary/90 dark:text-primary dark:hover:text-primary/90"
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
            {t('profile.upload.photo')}
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
        <div className="space-y-1">
          <h3 className="text-lg font-bold">{userProfile?.display_name || userEmail}</h3>
          <Badge 
            className="bg-badge-subscription-bg dark:bg-badge-subscription-bg-dark text-badge-subscription-text font-medium py-1.5 px-3 hover:bg-badge-subscription-bg dark:hover:bg-badge-subscription-bg-dark"
          >
            {getSubscriptionLabel(customerData?.subscription_plan)}
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
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
      </div>
    </div>
  );
};