
import { useLanguage } from "@/contexts/LanguageContext";

interface SignUpPromptProps {
  onGetStarted: () => void;
}

export const SignUpPrompt = ({ onGetStarted }: SignUpPromptProps) => {
  const { language } = useLanguage();
  
  return (
    <div className="mt-6 text-center text-sm text-[#000000A6] dark:text-[#FFFFFFA6] font-medium font-system-ui">
      {language === 'sv' ? "Har du inget konto? " : "Don't have an account? "}
      <a 
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onGetStarted();
        }} 
        className="font-[700] underline text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF] font-system-ui"
      >
        {language === 'sv' ? "Kom igång" : "Get started"}
      </a>
    </div>
  );
};
