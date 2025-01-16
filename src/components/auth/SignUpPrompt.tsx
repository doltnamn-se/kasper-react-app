import { useLanguage } from "@/contexts/LanguageContext";

export const SignUpPrompt = () => {
  const { language } = useLanguage();
  
  return (
    <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 font-system-ui">
      {language === 'sv' ? "Har du inget konto? " : "Don't have an account? "}
      <a 
        href="https://doltnamn.se/#planer" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="font-semibold text-black dark:text-white hover:underline font-system-ui"
      >
        {language === 'sv' ? "Kom igång" : "Get started"}
      </a>
    </div>
  );
};