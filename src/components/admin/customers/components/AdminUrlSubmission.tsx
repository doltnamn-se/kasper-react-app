
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";

interface AdminUrlSubmissionProps {
  customerId: string;
  additionalUrls?: string;
  setAdditionalUrls?: (value: string) => void;
  onUpdateUrlLimits?: () => void;
  isUpdating?: boolean;
}

export const AdminUrlSubmission = ({
  customerId,
  additionalUrls = "",
  setAdditionalUrls = () => {},
  onUpdateUrlLimits = () => {},
  isUpdating = false
}: AdminUrlSubmissionProps) => {
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsSubmitting(true);
    try {
      // Initialize status history
      const timestamp = new Date().toISOString();
      const initialStatus = {
        status: 'received',
        timestamp: timestamp
      };

      const { error } = await supabase
        .from('removal_urls')
        .insert({
          customer_id: customerId,
          url: url.trim(),
          status: 'received',
          display_in_incoming: true,
          status_history: [initialStatus]
        });

      if (error) throw error;

      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ['customer-data', customerId] });
      await queryClient.invalidateQueries({ queryKey: ['customer-urls', customerId] });
      
      toast({
        title: t('toast.success'),
        description: t('toast.url.added'),
      });
      
      setUrl("");
    } catch (error) {
      console.error('Error adding URL:', error);
      toast({
        title: t('toast.error'),
        description: t('toast.url.error'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        <h3 className="text-base font-medium text-[#000000] dark:text-[#FFFFFFA6]">
          {t('url.limits')}
        </h3>
        
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            value={additionalUrls}
            onChange={(e) => setAdditionalUrls(e.target.value)}
            className="w-24"
            min="0"
          />
          <Button 
            onClick={onUpdateUrlLimits}
            disabled={isUpdating}
            size="sm"
          >
            {isUpdating ? t('updating') : t('update')}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <h3 className="text-base font-medium text-[#000000] dark:text-[#FFFFFFA6]">
          {t('add.url')}
        </h3>
        
        <div className="flex gap-2">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t('enter.url')}
            className="flex-1"
            required
          />
          <Button 
            type="submit" 
            disabled={isSubmitting}
            size="sm"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
