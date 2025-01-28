import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface HidingSitesSelectionProps {
  onComplete: () => void;
}

type HidingSite = "eniro" | "hitta" | "birthday" | "ratsit" | "merinfo" | "mrkoll" | "upplysning";

const HIDING_SITES: { id: HidingSite; name: string }[] = [
  { id: 'eniro', name: 'Eniro.se' },
  { id: 'hitta', name: 'Hitta.se' },
  { id: 'mrkoll', name: 'Mrkoll.se' },
  { id: 'merinfo', name: 'Merinfo.se' },
  { id: 'ratsit', name: 'Ratsit.se' },
  { id: 'birthday', name: 'Birthday.se' },
  { id: 'upplysning', name: 'Upplysning.se' }
];

export const HidingSitesSelection = ({ onComplete }: HidingSitesSelectionProps) => {
  const [selectedSites, setSelectedSites] = useState<HidingSite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [noneSelected, setNoneSelected] = useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();

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
    setNoneSelected(true);
    setSelectedSites([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user session');

      const { error } = await supabase
        .from('customer_checklist_progress')
        .update({ selected_sites: noneSelected ? [] : selectedSites })
        .eq('customer_id', session.user.id);

      if (error) throw error;

      toast({
        title: "Sites selected",
        description: "Your hiding preferences have been saved.",
      });
      
      onComplete();
    } catch (error) {
      console.error('Error saving hiding preferences:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save hiding preferences. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {HIDING_SITES.map((site) => (
          <button
            key={site.id}
            type="button"
            onClick={() => handleSiteToggle(site.id)}
            disabled={noneSelected}
            className={`flex items-center justify-between p-4 text-left border rounded-lg transition-colors ${
              selectedSites.includes(site.id)
                ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            } ${noneSelected ? 'opacity-50' : ''}`}
          >
            <span className="font-medium">{site.name}</span>
            {selectedSites.includes(site.id) && (
              <Check className="h-4 w-4 text-green-500" />
            )}
          </button>
        ))}
        <button
          type="button"
          onClick={handleNoneSelection}
          className={`flex items-center justify-between p-4 text-left border rounded-lg transition-colors ${
            noneSelected
              ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <span className="font-medium">{language === 'sv' ? 'Ingen' : 'None'}</span>
          {noneSelected && (
            <X className="h-4 w-4 text-gray-500" />
          )}
        </button>
      </div>
      <Button
        type="submit"
        disabled={isLoading || (!noneSelected && selectedSites.length === 0)}
        className="w-full"
      >
        {isLoading ? t('saving') : language === 'sv' ? 'Välj' : 'Choose'}
      </Button>
    </form>
  );
};