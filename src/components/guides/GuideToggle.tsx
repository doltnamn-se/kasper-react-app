import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGuideCompletion } from "@/hooks/useGuideCompletion";
import { useGuideUtils } from "@/utils/guideUtils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GuideToggleProps {
  guideTitle: string;
  isCompleted: boolean;
}

export const GuideToggle = ({ guideTitle, isCompleted }: GuideToggleProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { getGuideId } = useGuideUtils();
  const [isToggling, setIsToggling] = useState(false);
  const [localCompleted, setLocalCompleted] = useState(isCompleted);

  // Sync local state with prop when it changes
  useEffect(() => {
    setLocalCompleted(isCompleted);
  }, [isCompleted]);

  const handleComplete = async (checked: boolean) => {
    if (isToggling) return;
    
    setIsToggling(true);
    console.log('Toggle clicked, current completion status:', checked);
    
    const guideId = getGuideId(guideTitle);
    if (!guideId) {
      console.error('Could not get guide ID for title:', guideTitle);
      setIsToggling(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('No authenticated user');
      }

      const userId = session.user.id;
      console.log('Updating completion status for guide:', guideId, 'User:', userId);

      // Get current progress
      const { data: currentProgress, error: fetchError } = await supabase
        .from('customer_checklist_progress')
        .select('completed_guides')
        .eq('customer_id', userId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Update completed_guides array
      const completedGuides = currentProgress?.completed_guides || [];
      const updatedGuides = checked
        ? [...new Set([...completedGuides, guideId])]
        : completedGuides.filter(id => id !== guideId);

      // Update both tables in a transaction-like manner
      const { error: progressError } = await supabase
        .from('customer_checklist_progress')
        .update({ 
          completed_guides: updatedGuides,
          updated_at: new Date().toISOString()
        })
        .eq('customer_id', userId);

      if (progressError) throw progressError;

      const { error: customerError } = await supabase
        .from('customers')
        .update({ 
          completed_guides: updatedGuides,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (customerError) throw customerError;

      setLocalCompleted(checked);
      console.log('Successfully updated guide completion status');
      
      toast({
        title: checked ? "Guide marked as completed" : "Guide marked as incomplete",
        description: `Successfully ${checked ? 'completed' : 'uncompleted'} the guide`,
      });

    } catch (error) {
      console.error('Error updating guide completion:', error);
      setLocalCompleted(!checked); // Revert on error
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update guide status. Please try again.",
      });
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="absolute top-4 right-4 flex items-center gap-2">
      <span className="text-sm text-[#4c4c49] dark:text-[#67676c]">
        {localCompleted 
          ? (language === 'sv' ? 'Klar' : 'Done')
          : (language === 'sv' ? 'Ej klar' : 'Not done')}
      </span>
      <Switch
        checked={localCompleted}
        onCheckedChange={handleComplete}
        disabled={isToggling}
        className="data-[state=checked]:bg-[#c3caf5] data-[state=unchecked]:bg-gray-200"
      />
    </div>
  );
};