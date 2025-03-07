
import { useLanguage } from "@/contexts/LanguageContext";

export const SignUpPrompt = () => {
  const { language } = useLanguage();
  
  return (
    <div className="mt-6 text-center text-sm text-[#000000A6] dark:text-[#FFFFFFA6] font-medium font-system-ui">
      {language === 'sv' ? "Har du inget konto? " : "Don't have an account? "}
      <a 
        href="https://digitaltskydd.se/#planer" 
        className="font-[900] text-black hover:text-black hover:underline dark:text-white dark:hover:text-white no-underline font-system-ui"
      >
        {language === 'sv' ? "Kom igång" : "Get started"}
      </a>
    </div>
  );
};
