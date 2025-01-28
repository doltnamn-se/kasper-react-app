import { useLanguage } from "@/contexts/LanguageContext";

export const RemovedLinks = () => {
  const { language } = useLanguage();
  
  return (
    <p className="text-[#000000] dark:text-white text-sm">
      {language === 'sv' 
        ? "När vi tar bort nya länkar som dykt upp om dig, kommer du att se de här"
        : "When we remove new links that have appeared about you, you will see them here"}
    </p>
  );
};