import { ChevronDown } from "lucide-react";

interface GuideAccordionFooterProps {
  isOpen: boolean;
  onAccordionChange: () => void;
}

export const GuideAccordionFooter = ({ isOpen, onAccordionChange }: GuideAccordionFooterProps) => {
  return (
    <div 
      className="px-6 py-4 border-t border-[#e5e7eb] dark:border-[#232325] flex justify-center items-center gap-2 cursor-pointer"
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