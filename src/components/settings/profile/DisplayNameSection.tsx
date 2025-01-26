import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Profile } from "@/types/customer";

interface DisplayNameSectionProps {
  userProfile: Profile | null;
  onDisplayNameUpdate: (name: string) => void;
}

export const DisplayNameSection = ({ userProfile, onDisplayNameUpdate }: DisplayNameSectionProps) => {
  const { t } = useLanguage();
  const [displayName, setDisplayName] = useState(userProfile?.display_name || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDisplayNameUpdate = async () => {
    try {
      setIsUpdating(true);
      console.log("Updating display name...");

      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', userProfile?.id);

      if (error) {
        console.error("Error updating display name:", error);
        throw error;
      }

      onDisplayNameUpdate(displayName);
      toast.success(t('success'));
    } catch (error) {
      console.error("Display name update failed:", error);
      toast.error(t('error.generic'));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor="displayName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {t('display.name')}
      </label>
      <div className="flex gap-2">
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="flex-1 bg-[#f4f4f4] dark:bg-[#2a2a2b] border-0"
          placeholder={t('display.name')}
        />
        <Button
          onClick={handleDisplayNameUpdate}
          disabled={isUpdating || !displayName || displayName === userProfile?.display_name}
          className="bg-[#e0e0e0] hover:bg-[#d0d0d0] text-[#000000] dark:bg-[#2a2a2b] dark:hover:bg-[#3a3a3b] dark:text-white"
        >
          {isUpdating ? t('loading') : t('save')}
        </Button>
      </div>
    </div>
  );
};