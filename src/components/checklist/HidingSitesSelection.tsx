import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";

interface HidingSitesSelectionProps {
  onComplete: () => void;
}

type HidingSite = "eniro" | "hitta" | "birthday" | "ratsit" | "merinfo";

const HIDING_SITES: { id: HidingSite; name: string; description: string }[] = [
  { id: 'eniro', name: 'Eniro', description: 'Phone directory and people search' },
  { id: 'hitta', name: 'Hitta.se', description: 'People and business search' },
  { id: 'birthday', name: 'Birthday.se', description: 'Birthday calendar' },
  { id: 'ratsit', name: 'Ratsit', description: 'Credit information' },
  { id: 'merinfo', name: 'Merinfo', description: 'Company and people information' }
];

export const HidingSitesSelection = ({ onComplete }: HidingSitesSelectionProps) => {
  const [selectedSites, setSelectedSites] = useState<HidingSite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSiteToggle = (siteId: HidingSite) => {
    setSelectedSites(prev =>
      prev.includes(siteId)
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user session');

      const { error } = await supabase
        .from('customer_checklist_progress')
        .update({ selected_sites: selectedSites })
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
      <div className="grid gap-3">
        {HIDING_SITES.map((site) => (
          <button
            key={site.id}
            type="button"
            onClick={() => handleSiteToggle(site.id)}
            className={`flex items-center justify-between p-4 text-left border rounded-lg transition-colors ${
              selectedSites.includes(site.id)
                ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div>
              <h3 className="font-medium">{site.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {site.description}
              </p>
            </div>
            {selectedSites.includes(site.id) && (
              <Check className="h-4 w-4 text-green-500" />
            )}
          </button>
        ))}
      </div>
      <Button
        type="submit"
        disabled={isLoading || selectedSites.length === 0}
        className="w-full"
      >
        {isLoading ? "Saving..." : "Save Preferences"}
      </Button>
    </form>
  );
};