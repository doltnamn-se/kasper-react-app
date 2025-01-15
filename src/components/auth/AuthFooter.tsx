import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

// Define the current app version - we'll start from 1.0.0
const APP_VERSION = "1.0.0";

export const AuthFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="flex justify-center gap-1 mb-2">
        <Button 
          variant="link" 
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-normal hover:no-underline"
        >
          Integritet
          <ArrowUpRight className="w-1.5 h-1.5 ml-0" />
        </Button>
        <Button 
          variant="link" 
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-normal hover:no-underline"
        >
          Licensvillkor
          <ArrowUpRight className="w-1.5 h-1.5 ml-0" />
        </Button>
        <Button 
          variant="link" 
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-normal hover:no-underline"
        >
          Användarvillkor
          <ArrowUpRight className="w-1.5 h-1.5 ml-0" />
        </Button>
      </div>
      <p className="text-[11px] text-gray-400 dark:text-gray-500">
        {currentYear} © Doltnamn.se &nbsp;&nbsp;·&nbsp;&nbsp; App version {APP_VERSION}
      </p>
    </div>
  );
};