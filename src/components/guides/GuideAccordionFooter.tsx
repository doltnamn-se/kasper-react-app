
import { ChevronDown } from "lucide-react";

interface GuideAccordionFooterProps {
  isOpen: boolean;
  onAccordionChange: () => void;
}

export const GuideAccordionFooter = ({ isOpen, onAccordionChange }: GuideAccordionFooterProps) => {
  return (
    <div 
      className="py-2 flex justify-center items-center gap-2 cursor-pointer transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-[#232325] rounded-b-[4px]"
      onClick={onAccordionChange}
    >
      <span className="text-sm font-medium text-[#000000] dark:text-white">Guide</span>
      <ChevronDown 
        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`}
      />
    </div>
  );
};
