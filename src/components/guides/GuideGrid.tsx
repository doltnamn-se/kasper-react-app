
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
    // Modified grid layout to display three columns on desktop
    // Create three column arrays instead of two
    const firstColumnGuides = sectionGuides.filter((_, index) => index % 3 === 0);
    const secondColumnGuides = sectionGuides.filter((_, index) => index % 3 === 1);
    const thirdColumnGuides = sectionGuides.filter((_, index) => index % 3 === 2);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col gap-4">
          {firstColumnGuides.map((guide, index) => (
            <GuideCard
              key={`${guide.title}-${index}`}
              guide={guide}
              accordionId={`col1-${index}`}
              isOpen={openAccordions.has(`col1-${index}`)}
              onAccordionChange={onAccordionChange}
              isCompleted={currentCompletedGuides.includes(getGuideId(guide.title))}
            />
          ))}
        </div>
        <div className="flex flex-col gap-4">
          {secondColumnGuides.map((guide, index) => (
            <GuideCard
              key={`${guide.title}-${index}`}
              guide={guide}
              accordionId={`col2-${index}`}
              isOpen={openAccordions.has(`col2-${index}`)}
              onAccordionChange={onAccordionChange}
              isCompleted={currentCompletedGuides.includes(getGuideId(guide.title))}
            />
          ))}
        </div>
        <div className="flex flex-col gap-4">
          {thirdColumnGuides.map((guide, index) => (
            <GuideCard
              key={`${guide.title}-${index}`}
              guide={guide}
              accordionId={`col3-${index}`}
              isOpen={openAccordions.has(`col3-${index}`)}
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
      <div>
        {renderGuideSection(guides)}
      </div>
    </div>
  );
};
