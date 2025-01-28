import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { TooltipProvider, TooltipContent, TooltipTrigger, Tooltip } from "@/components/ui/tooltip";

interface GuideStepProps {
  stepIndex: number;
  text: string;
  showCopyButton: boolean;
  guideTitle: string;
}

export const GuideStep = ({ stepIndex, text, showCopyButton, guideTitle }: GuideStepProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleCopyMessage = async (text: string) => {
    const messageTemplate = text.match(/\"([^"]+)\"/)?.at(1)?.trim();
    if (messageTemplate) {
      await navigator.clipboard.writeText(messageTemplate);
      toast({
        title: t('toast.copied.title'),
        description: t('toast.copied.description'),
        duration: 5000,
      });
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#e0e0e0] dark:bg-[#3A3A3B] flex items-center justify-center">
        <span className="text-xs font-medium">{stepIndex}</span>
      </div>
      <div className="flex-grow flex items-center gap-2">
        <span 
          className="text-sm leading-relaxed font-medium text-[#000000] dark:text-white"
          style={{ whiteSpace: 'pre-line' }}
        >
          {text}
        </span>
        {showCopyButton && (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleCopyMessage(text)}
                  className="flex-shrink-0 h-6 w-6 flex items-center justify-center transition-colors duration-200 text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF]"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('copy')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};