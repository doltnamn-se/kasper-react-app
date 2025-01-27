import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Profile } from "@/types/customer";
import { getUserInitials } from "@/utils/profileUtils";
import { Upload, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface AvatarSectionProps {
  userProfile: Profile | null;
  onAvatarUpdate: (url: string | null) => void;
}

export const AvatarSection = ({ userProfile, onAvatarUpdate }: AvatarSectionProps) => {
  const { t } = useLanguage();
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
    <div className="flex items-start gap-6">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={userProfile?.avatar_url || undefined} />
          <AvatarFallback>{getUserInitials(userProfile)}</AvatarFallback>
        </Avatar>
        
        {/* Upload button */}
        <div className="absolute -bottom-1 -right-1">
          <div className="relative">
            <div className="bg-white dark:bg-[#2a2a2b] rounded-full p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3a3a3b]">
              <Upload className="h-4 w-4" />
            </div>
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleAvatarUpload}
              accept="image/*"
              disabled={isUploading}
              aria-label={t('upload')}
            />
          </div>
        </div>

        {/* Delete button */}
        {userProfile?.avatar_url && (
          <button
            onClick={handleAvatarDelete}
            className="absolute -top-1 -right-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-semibold">
          {userProfile?.display_name}
        </h3>
        <Badge 
          variant="secondary"
          className="bg-badge-subscription-bg dark:bg-badge-subscription-bg-dark text-badge-subscription-text"
        >
          {getSubscriptionLabel(customerData?.subscription_plan)}
        </Badge>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {userProfile?.email}
        </p>
      </div>
    </div>
  );
};