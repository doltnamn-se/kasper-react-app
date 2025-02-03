import { useLanguage } from "@/contexts/LanguageContext";

export const SignUpPrompt = () => {
  const { language } = useLanguage();
  
  return (
    <div className="mt-6 text-center text-sm text-[#000000A6] dark:text-[#FFFFFFA6] font-medium font-system-ui">
      {language === 'sv' ? "Har du inget konto? " : "Don't have an account? "}
      <a 
        href="https://doltnamn.se/#planer" 
        className="font-medium text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF] no-underline font-system-ui"
      >
        {language === 'sv' ? "Kom igång" : "Get started"}
      </a>
    </div>
  );
};