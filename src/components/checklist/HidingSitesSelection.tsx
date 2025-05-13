
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useChecklistSteps } from "@/hooks/useChecklistSteps";

interface HidingSitesSelectionProps {
  onComplete: () => void;
}

type HidingSite = "eniro" | "hitta" | "birthday" | "ratsit" | "merinfo" | "mrkoll";

const HIDING_SITES: { id: HidingSite; name: string }[] = [
  { id: 'eniro', name: 'Eniro.se' },
  { id: 'hitta', name: 'Hitta.se' },
  { id: 'mrkoll', name: 'Mrkoll.se' },
  { id: 'merinfo', name: 'Merinfo.se' },
  { id: 'ratsit', name: 'Ratsit.se' },
  { id: 'birthday', name: 'Birthday.se' }
  // Removed upplysning.se
];

export const HidingSitesSelection = ({ onComplete }: HidingSitesSelectionProps) => {
  const [selectedSites, setSelectedSites] = useState<HidingSite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [noneSelected, setNoneSelected] = useState(false);
  const { t, language } = useLanguage();
  const { handleStepChange } = useChecklistSteps();

  const handleSiteToggle = (siteId: HidingSite) => {
    if (noneSelected) {
      setNoneSelected(false);
    }
    setSelectedSites(prev =>
      prev.includes(siteId)
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    );
  };

  const handleNoneSelection = () => {
    setNoneSelected(prev => !prev);
    if (!noneSelected) {
      setSelectedSites([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user session');

      // Get all site IDs
      const allSiteIds = HIDING_SITES.map(site => site.id);
      
      // Calculate which sites should be marked as completed (the ones NOT selected)
      const completedSites = noneSelected ? allSiteIds : allSiteIds.filter(id => !selectedSites.includes(id));

      console.log('Marking sites as completed:', completedSites);
      console.log('Selected sites (not completed):', selectedSites);

      // Update checklist progress with selected sites
      const { error: progressError } = await supabase
        .from('customer_checklist_progress')
        .update({ 
          selected_sites: noneSelected ? [] : selectedSites,
          completed_guides: completedSites
        })
        .eq('customer_id', session.user.id);

      if (progressError) throw progressError;

      // Update customer record to reflect completed guides
      const { error: customerError } = await supabase
        .from('customers')
        .update({ completed_guides: completedSites })
        .eq('id', session.user.id);

      if (customerError) throw customerError;
      
      onComplete();
      // Move to next step
      handleStepChange(4);
    } catch (error) {
      console.error('Error saving hiding preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
        {HIDING_SITES.map((site) => (
          <button
            key={site.id}
            type="button"
            onClick={() => handleSiteToggle(site.id)}
            disabled={noneSelected}
            className={`flex items-center justify-between p-3 sm:p-4 text-left border rounded-lg transition-colors ${
              selectedSites.includes(site.id)
                ? 'border-black dark:border-white bg-[#f8f8f7] dark:bg-[#2A2A2B]'
                : 'border-gray-200 dark:border-[#232325] hover:border-gray-300 dark:hover:border-[#2A2A2B]'
            } ${noneSelected ? 'opacity-50' : ''}`}
          >
            <span className="font-medium text-sm sm:text-base">{site.name}</span>
            {selectedSites.includes(site.id) && (
              <Check className="h-4 w-4 text-green-500" />
            )}
          </button>
        ))}
        <button
          type="button"
          onClick={handleNoneSelection}
          className={`flex items-center justify-between p-3 sm:p-4 text-left border rounded-lg transition-colors ${
            noneSelected
              ? 'border-black dark:border-white bg-[#f8f8f7] dark:bg-[#2A2A2B]'
              : 'border-gray-200 dark:border-[#232325] hover:border-gray-300 dark:hover:border-[#2A2A2B]'
          }`}
        >
          <span className="font-medium text-sm sm:text-base">{language === 'sv' ? 'Ingen' : 'None'}</span>
          {noneSelected && (
            <X className="h-4 w-4 text-gray-500" />
          )}
        </button>
      </div>
      <Button
        type="submit"
        disabled={isLoading || (!noneSelected && selectedSites.length === 0)}
        className="w-full h-12"
      >
        {isLoading ? t('saving') : language === 'sv' ? 'Välj' : 'Choose'}
      </Button>
    </form>
  );
};
