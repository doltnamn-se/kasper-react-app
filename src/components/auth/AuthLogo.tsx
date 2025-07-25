
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

  const isAuthRoute = location.pathname.startsWith('/auth');
  const isAdminRoute = location.pathname.startsWith('/admin');
  const logoHeight = isMobile ? 'h-8' : 'h-10';  // Changed from h-6 to h-10 for desktop version

  // For auth routes, show the auth-specific logo
  if (isAuthRoute) {
    return (
      <div className="flex justify-center w-full">
        <a href="https://digitaltskydd.se/" className="relative h-16 w-64 block">
          <img 
            src="/lovable-uploads/kasper-logo-app-light.svg" 
            alt="Logo" 
            className={`h-16 w-auto absolute inset-0 transition-opacity duration-200 ${isDarkMode ? 'opacity-0' : 'opacity-100'}`} 
          />
          <img 
            src="/lovable-uploads/kasper-logo-app-dark.svg" 
            alt="Logo" 
            className={`h-16 w-auto absolute inset-0 transition-opacity duration-200 ${isDarkMode ? 'opacity-100' : 'opacity-0'}`} 
          />
        </a>
      </div>
    );
  }

  // For non-auth routes (desktop sidebar logo)
  if (!isMobile && !isAdminRoute) {
    return (
      <div 
        className={`relative ${logoHeight} w-auto ${centered ? 'mx-auto' : ''}`} 
        {...props}
      >
        <img 
          src="/lovable-uploads/kasper-logo-app-dark.svg" 
          alt="Logo" 
          className={`h-full w-auto absolute inset-0 transition-opacity duration-200 ${isDarkMode ? 'opacity-0' : 'opacity-100'}`} 
        />
        <img 
          src="/lovable-uploads/kasper-logo-app-light.svg" 
          alt="Logo" 
          className={`h-full w-auto absolute inset-0 transition-opacity duration-200 ${isDarkMode ? 'opacity-100' : 'opacity-0'}`} 
        />
      </div>
    );
  }

  // For admin routes or mobile
  return (
    <div 
      className={`relative ${isAdminRoute ? 'h-auto w-auto' : `${logoHeight} w-48`} ${centered ? 'mx-auto' : ''}`} 
      {...props}
    >
      {isAdminRoute ? (
        <div className="relative h-[2.5rem] w-auto">
          <img 
            src="/lovable-uploads/kasper-logo-app-dark.svg" 
            alt="Admin Logo" 
            className={`h-[2.5rem] w-auto absolute inset-0 object-contain transition-opacity duration-200 ${isDarkMode ? 'opacity-0' : 'opacity-100'}`}
          />
          <img 
            src="/lovable-uploads/kasper-logo-app-light.svg" 
            alt="Admin Logo" 
            className={`h-[2.5rem] w-auto absolute inset-0 object-contain transition-opacity duration-200 ${isDarkMode ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>
      ) : isMobile ? (
        <div className="relative h-[2.5rem] w-auto">
          <img 
            src="/lovable-uploads/kasper-logo-app-dark.svg" 
            alt="Mobile Logo" 
            className={`h-[2.5rem] w-auto absolute inset-0 object-contain transition-opacity duration-200 ${isDarkMode ? 'opacity-0' : 'opacity-100'}`}
          />
          <img 
            src="/lovable-uploads/kasper-logo-app-light.svg" 
            alt="Mobile Logo" 
            className={`h-[2.5rem] w-auto absolute inset-0 object-contain transition-opacity duration-200 ${isDarkMode ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>
      ) : (
        <>
          <img 
            src="/lovable-uploads/kasper-logo-app-light.svg" 
            alt="Logo" 
            className={`h-12 w-auto absolute inset-0 transition-opacity duration-200 ${isDarkMode ? 'opacity-0' : 'opacity-100'}`} 
          />
          <img 
            src="/lovable-uploads/kasper-logo-app-dark.svg" 
            alt="Logo" 
            className={`h-12 w-auto absolute inset-0 transition-opacity duration-200 ${isDarkMode ? 'opacity-100' : 'opacity-0'}`} 
          />
        </>
      )}
    </div>
  );
};
