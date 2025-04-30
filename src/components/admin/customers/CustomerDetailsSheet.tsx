
// This file is kept for backward compatibility but its functionality has been moved to CustomerView.tsx
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { CustomerWithProfile } from "@/types/customer";

interface CustomerDetailsSheetProps {
  customer: CustomerWithProfile | null;
  onOpenChange: (open: boolean) => void;
}

export const CustomerDetailsSheet = ({ customer, onOpenChange }: CustomerDetailsSheetProps) => {
  // This is now a minimal implementation as we've moved to a full page view
  // Return an empty Sheet when no customer is selected
  if (!customer) return null;
  
  // Return a closed Sheet (will trigger onOpenChange to clean up state)
  return (
    <Sheet open={false} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-xl w-full p-0"></SheetContent>
    </Sheet>
  );
};
