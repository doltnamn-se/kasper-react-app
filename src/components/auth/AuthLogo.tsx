
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface AuthLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  centered?: boolean;
}
export const AuthLogo: React.FC<AuthLogoProps> = ({
  className,
  centered = false,
  ...props
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setIsDarkMode(isDark);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const logoHeight = isMobile ? 'h-8' : 'h-12';

  return (
    <div 
      className={`relative ${isAdminRoute ? 'h-auto w-auto' : `${logoHeight} w-48`} ${centered ? 'mx-auto' : ''}`} 
      {...props}
    >
      {isAdminRoute ? (
        <img 
          src="/lovable-uploads/digitaltskydd-admin-logo.svg" 
          alt="Admin Logo" 
          className="h-[2rem] w-auto object-contain" 
        />
      ) : isMobile ? (
        <img 
          src="/lovable-uploads/digitaltskydd-admin-logo.svg" 
          alt="Mobile Logo" 
          className="h-[2rem] w-auto object-contain" 
        />
      ) : (
        <>
          <img 
            src="/lovable-uploads/digitaltskydd.se-app-logo-dark.svg" 
            alt="Logo" 
            className={`${logoHeight} w-auto absolute inset-0 transition-opacity duration-200 ${isDarkMode ? 'opacity-0' : 'opacity-100'}`} 
          />
          <img 
            src="/lovable-uploads/digitaltskydd.se-app-logo-white.svg" 
            alt="Logo" 
            className={`${logoHeight} w-auto absolute inset-0 transition-opacity duration-200 ${isDarkMode ? 'opacity-100' : 'opacity-0'}`} 
          />
        </>
      )}
    </div>
  );
};
