import { Button } from "@/components/ui/button";

export const AuthFooter = () => {
  return (
    <div className="flex justify-center gap-6 mt-8">
      <Button variant="link" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
        Integritet
      </Button>
      <Button variant="link" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
        Licensvillkor
      </Button>
      <Button variant="link" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
        Användarvillkor
      </Button>
    </div>
  );
};