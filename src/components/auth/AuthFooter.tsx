import { Button } from "@/components/ui/button";

export const AuthFooter = () => {
  return (
    <div className="flex justify-center gap-6 mb-4">
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
  );
};