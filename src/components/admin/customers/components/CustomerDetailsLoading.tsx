
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Drawer, DrawerContent } from "@/components/ui/drawer";

interface CustomerDetailsLoadingProps {
  isMobile: boolean;
}

export const CustomerDetailsLoading = ({ isMobile }: CustomerDetailsLoadingProps) => {
  return isMobile ? (
    <DrawerContent className="px-4 pb-4 pt-6">
      <div className="flex items-center justify-center h-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    </DrawerContent>
  ) : (
    <SheetContent side="right" className="sm:max-w-xl w-full p-0">
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    </SheetContent>
  );
};
