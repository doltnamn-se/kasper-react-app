import { GuideCard } from "./GuideCard";
import { useGuideData } from "@/hooks/useGuideData";

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
  
  const leftColumnGuides = guides.filter((_, index) => index % 2 === 0);
  const rightColumnGuides = guides.filter((_, index) => index % 2 === 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex flex-col gap-4">
        {leftColumnGuides.map((guide, index) => (
          <GuideCard
            key={index}
            guide={guide}
            accordionId={`left-${index}`}
            isOpen={openAccordions.has(`left-${index}`)}
            onAccordionChange={onAccordionChange}
            isCompleted={completedGuides.includes(getGuideId(guide.title))}
          />
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {rightColumnGuides.map((guide, index) => (
          <GuideCard
            key={index}
            guide={guide}
            accordionId={`right-${index}`}
            isOpen={openAccordions.has(`right-${index}`)}
            onAccordionChange={onAccordionChange}
            isCompleted={completedGuides.includes(getGuideId(guide.title))}
          />
        ))}
      </div>
    </div>
  );
};