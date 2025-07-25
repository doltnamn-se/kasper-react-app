
import React, { useEffect, useState } from "react";

export const AuthEyeLogo: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
    console.log('AuthEyeLogo: Dark mode status:', isDark);

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setIsDarkMode(isDark);
          console.log('AuthEyeLogo: Dark mode changed to:', isDark);
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
    <a href="https://joinkasper.com/" className="inline-block mb-6">
      <div className="relative h-10 w-auto mx-auto min-w-[120px]">
        <img
          src="/lovable-uploads/kasper-logo-app-light.svg"
          alt="Logo"
          className={`h-10 w-auto transition-opacity duration-200 pointer-events-none ${isDarkMode ? 'opacity-100' : 'opacity-0'}`}
          style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)' }}
          draggable="false"
          onContextMenu={(e) => e.preventDefault()}
          onLoad={() => console.log('AuthEyeLogo: Light logo loaded successfully')}
          onError={(e) => console.error('AuthEyeLogo: Light logo failed to load:', e)}
        />
        <img
          src="/lovable-uploads/kasper-logo-app-dark.svg"
          alt="Logo"
          className={`h-10 w-auto transition-opacity duration-200 pointer-events-none ${isDarkMode ? 'opacity-0' : 'opacity-100'}`}
          style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)' }}
          draggable="false"
          onContextMenu={(e) => e.preventDefault()}
          onLoad={() => console.log('AuthEyeLogo: Dark logo loaded successfully')}
          onError={(e) => console.error('AuthEyeLogo: Dark logo failed to load:', e)}
        />
      </div>
    </a>
  );
};
