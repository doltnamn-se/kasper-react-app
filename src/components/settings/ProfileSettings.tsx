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
import { useQuery } from "@tanstack/react-query";

export const ProfileSettings = () => {
  const { t } = useLanguage();
  const { userProfile, userEmail } = useUserProfile();
  const [isUploading, setIsUploading] = useState(false);

  // Fetch customer data to get subscription plan
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
          <Avatar className="h-20 w-20 bg-[#e8e8e8] dark:bg-[#303032]">
            <AvatarImage src={userProfile?.avatar_url || undefined} />
            <AvatarFallback className="text-lg font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
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
        <div className="space-y-1">
          <h3 className="text-lg font-bold">{userProfile?.display_name || userEmail}</h3>
          <Badge 
            className="bg-badge-subscription-bg dark:bg-badge-subscription-bg-dark text-badge-subscription-text font-bold py-1.5 px-3 hover:bg-badge-subscription-bg dark:hover:bg-badge-subscription-bg-dark"
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