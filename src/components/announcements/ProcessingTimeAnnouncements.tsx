import { Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const ProcessingTimeAnnouncements = () => {
  const { language } = useLanguage();

  const mrKollText = language === 'sv'
    ? "Just nu är MrKolls handläggningstid för borttagning av profiler mellan 3-5 veckor"
    : "Right now, MrKoll's processing time for removing profiles is between 3-5 weeks";

  const googleText = language === 'sv'
    ? "Just nu är Googles handläggningstid för borttagning av länkar mellan 6-12 veckor"
    : "Right now, Google's processing time for link removal is between 6-12 weeks";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="p-4 md:p-6 rounded-2xl border bg-[hsl(var(--id-info-bg))] dark:bg-[hsl(var(--id-info-bg))] border-[hsl(var(--id-info-border))] dark:border-[hsl(var(--id-info-border))]">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 mt-0.5 shrink-0 [&>circle]:fill-[hsl(var(--id-info-icon-fill))] [&>circle]:stroke-[hsl(var(--id-info-icon-fill))] [&>path]:stroke-[hsl(var(--id-info-icon-i))]" />
          <p className="text-sm text-[hsl(var(--id-info-text))]">{mrKollText}</p>
        </div>
      </div>

      <div className="p-4 md:p-6 rounded-2xl border bg-[hsl(var(--id-info-bg))] dark:bg-[hsl(var(--id-info-bg))] border-[hsl(var(--id-info-border))] dark:border-[hsl(var(--id-info-border))]">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 mt-0.5 shrink-0 [&>circle]:fill-[hsl(var(--id-info-icon-fill))] [&>circle]:stroke-[hsl(var(--id-info-icon-fill))] [&>path]:stroke-[hsl(var(--id-info-icon-i))]" />
          <p className="text-sm text-[hsl(var(--id-info-text))]">{googleText}</p>
        </div>
      </div>
    </div>
  );
};
