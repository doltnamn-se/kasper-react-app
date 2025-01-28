import { useLanguage } from "@/contexts/LanguageContext";

export const IncomingLinks = () => {
  const { language } = useLanguage();
  
  return (
    <p className="text-[#000000A6] dark:text-[#FFFFFFA6] text-sm font-medium">
      {language === 'sv' 
        ? "När det dyker upp nya länkar om dig kommer du att få en notis och se länken här"
        : "When new links about you appear, you will receive a notification and see the link here"}
    </p>
  );
};