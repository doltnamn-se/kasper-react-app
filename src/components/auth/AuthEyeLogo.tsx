
import React, { useEffect, useState } from "react";

export const AuthEyeLogo: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  return (
    <a href="https://digitaltskydd.se/" className="inline-block mb-6">
      <div className="relative h-10 w-auto mx-auto">
        <img
          src="/lovable-uploads/kasper-logo-app-light.svg"
          alt="Logo"
          className={`h-10 w-auto absolute inset-0 transition-opacity duration-200 pointer-events-none ${isDarkMode ? 'opacity-0' : 'opacity-100'}`}
          draggable="false"
          onContextMenu={(e) => e.preventDefault()}
        />
        <img
          src="/lovable-uploads/kasper-logo-app-dark.svg"
          alt="Logo"
          className={`h-10 w-auto absolute inset-0 transition-opacity duration-200 pointer-events-none ${isDarkMode ? 'opacity-100' : 'opacity-0'}`}
          draggable="false"
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    </a>
  );
};
