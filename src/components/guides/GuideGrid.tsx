import { GuideCard } from "./GuideCard";
import { useGuideData } from "@/hooks/useGuideData";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface GuideGridProps {
  guides: Array<{
    title: string;
    steps: Array<{ text: string }>;
  }>;
  openAccordions: Set<string>;
  onAccordionChange: (accordionId: string) => void;
  completedGuides: string[];
}

export const GuideGrid = ({ 
  guides, 
  openAccordions, 
  onAccordionChange, 
  completedGuides 
}: GuideGridProps) => {
  const { getGuideId } = useGuideData();
  const { language } = useLanguage();

  // Add a query to keep track of completed guides in real-time
  const { data: currentCompletedGuides = completedGuides } = useQuery({
    queryKey: ['completed-guides'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return [];

      const { data, error } = await supabase
        .from('customer_checklist_progress')
        .select('completed_guides')
        .eq('customer_id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching completed guides:', error);
        return completedGuides;
      }

      return data?.completed_guides || [];
    },
    initialData: completedGuides,
  });
  
  const pendingGuides = guides.filter(guide => 
    !currentCompletedGuides.includes(getGuideId(guide.title))
  );
  
  const completedGuidesList = guides.filter(guide => 
    currentCompletedGuides.includes(getGuideId(guide.title))
  );

  const renderGuideSection = (sectionGuides: typeof guides) => {
    const leftColumnGuides = sectionGuides.filter((_, index) => index % 2 === 0);
    const rightColumnGuides = sectionGuides.filter((_, index) => index % 2 === 1);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          {leftColumnGuides.map((guide, index) => (
            <GuideCard
              key={`${guide.title}-${currentCompletedGuides.includes(getGuideId(guide.title))}`}
              guide={guide}
              accordionId={`left-${index}`}
              isOpen={openAccordions.has(`left-${index}`)}
              onAccordionChange={onAccordionChange}
              isCompleted={currentCompletedGuides.includes(getGuideId(guide.title))}
            />
          ))}
        </div>
        <div className="flex flex-col gap-4">
          {rightColumnGuides.map((guide, index) => (
            <GuideCard
              key={`${guide.title}-${currentCompletedGuides.includes(getGuideId(guide.title))}`}
              guide={guide}
              accordionId={`right-${index}`}
              isOpen={openAccordions.has(`right-${index}`)}
              onAccordionChange={onAccordionChange}
              isCompleted={currentCompletedGuides.includes(getGuideId(guide.title))}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {pendingGuides.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-[#4c4c49] dark:text-white">
            {language === 'sv' ? 'Att genomföra' : 'Awaiting completion'}
          </h2>
          {renderGuideSection(pendingGuides)}
        </div>
      )}
      
      {completedGuidesList.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-[#4c4c49] dark:text-white">
            {language === 'sv' ? 'Avslutade' : 'Completed'}
          </h2>
          {renderGuideSection(completedGuidesList)}
        </div>
      )}
    </div>
  );
};
