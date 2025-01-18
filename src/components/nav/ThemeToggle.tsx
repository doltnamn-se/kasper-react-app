import { useState, useEffect } from "react";
import { Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="text-[#5e5e5e] dark:text-gray-400 hover:bg-black/5 dark:hover:bg-[#232325] h-8 w-8"
      onClick={toggleDarkMode}
    >
      <Moon className="w-4 h-4" />
    </Button>
  );
};