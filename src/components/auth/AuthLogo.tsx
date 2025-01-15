import { useEffect, useState } from "react";

export const AuthLogo = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(isDark);
  }, []);

  // Update dark mode state when it changes
  useEffect(() => {
    const handleDarkModeChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addEventListener('change', handleDarkModeChange);

    return () => {
      darkModeMediaQuery.removeEventListener('change', handleDarkModeChange);
    };
  }, []);

  return (
    <div className="relative h-8">
      <img 
        src="/lovable-uploads/a60e3543-e8d5-4f66-a2eb-97eeedd073ae.png"
        alt="Logo" 
        className={`mx-auto h-8 absolute inset-0 transition-opacity duration-200 ${isDarkMode ? 'opacity-0' : 'opacity-100'}`}
      />
      <img 
        src="/lovable-uploads/868b20a1-c3f1-404c-b8da-9d33fe738d9d.png"
        alt="Logo" 
        className={`mx-auto h-8 absolute inset-0 transition-opacity duration-200 ${isDarkMode ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};