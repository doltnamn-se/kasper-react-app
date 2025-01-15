import { Button } from "@/components/ui/button";

export const AuthFooter = () => {
  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="flex justify-center gap-4 mb-2">
        <Button variant="link" className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-normal">
          Integritet
        </Button>
        <Button variant="link" className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-normal">
          Licensvillkor
        </Button>
        <Button variant="link" className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-normal">
          Användarvillkor
        </Button>
      </div>
      <p className="text-[11px] text-gray-400 dark:text-gray-500">
        2025 © Doltnamn.se   ·   App version X
      </p>
    </div>
  );
};