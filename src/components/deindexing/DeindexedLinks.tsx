import { useLanguage } from "@/contexts/LanguageContext";

export const DeindexedLinks = () => {
  const { language } = useLanguage();
  
  return (
    <p className="text-[#000000A6] dark:text-[#FFFFFFA6] text-sm font-medium">
      {language === 'sv' 
        ? "När vi tar bort nya länkar som dykt upp om dig, kommer du att se de här"
        : "When we remove new links that have appeared about you, you will see them here"}
    </p>
  );
};