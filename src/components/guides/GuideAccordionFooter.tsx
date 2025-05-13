
import { ChevronDown } from "lucide-react";

interface GuideAccordionFooterProps {
  isOpen: boolean;
  onAccordionChange: () => void;
}

export const GuideAccordionFooter = ({ isOpen, onAccordionChange }: GuideAccordionFooterProps) => {
  return (
    <div 
      className="py-2 flex justify-center items-center gap-2 cursor-pointer rounded-b-[4px] z-10 transition-all duration-300 ease-in-out"
      onClick={(e) => {
        e.stopPropagation();
        onAccordionChange();
      }}
    >
      <span className="text-sm font-medium text-[#000000] dark:text-white">Guide</span>
      <ChevronDown 
        className={`h-4 w-4 shrink-0 transition-transform duration-300 ease-in-out ${
          isOpen ? 'rotate-180' : ''
        }`}
      />
    </div>
  );
};
