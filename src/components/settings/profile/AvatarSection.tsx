import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Profile } from "@/types/customer";
import { getUserInitials } from "@/utils/profileUtils";
import { useQuery } from "@tanstack/react-query";
import { AvatarUploadButton } from "./AvatarUploadButton";
import { AvatarDeleteButton } from "./AvatarDeleteButton";
import { ProfileInfo } from "./ProfileInfo";

interface AvatarSectionProps {
  userProfile: Profile | null;
  onAvatarUpdate: (url: string | null) => void;
}

export const AvatarSection = ({ userProfile, onAvatarUpdate }: AvatarSectionProps) => {
  const { t } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);

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

  return (
    <div className="flex items-start gap-6">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={userProfile?.avatar_url || undefined} />
          <AvatarFallback>{getUserInitials(userProfile)}</AvatarFallback>
        </Avatar>
        
        <AvatarUploadButton 
          isUploading={isUploading}
          onUpload={handleAvatarUpload}
        />

        <AvatarDeleteButton 
          onDelete={handleAvatarDelete}
          show={!!userProfile?.avatar_url}
        />
      </div>

      <ProfileInfo 
        userProfile={userProfile}
        subscriptionPlan={customerData?.subscription_plan}
      />
    </div>
  );
};