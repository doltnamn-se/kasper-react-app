
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { CustomerWithProfile } from "@/types/customer";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserInitials } from "@/utils/profileUtils";
import { BadgeCheck } from "lucide-react";

interface CustomerDetailsSheetProps {
  customer: CustomerWithProfile | null;
  onOpenChange: (open: boolean) => void;
}

export const CustomerDetailsSheet = ({ customer, onOpenChange }: CustomerDetailsSheetProps) => {
  if (!customer) return null;

  return (
    <Sheet open={!!customer} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-xl w-full px-0">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="px-6 space-y-6">
            <div className="flex flex-col items-center text-center pt-6">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white dark:border-[#1e1e1e]">
                  <AvatarImage src={customer.profile?.avatar_url} />
                  <AvatarFallback className="bg-[#e8e8e8] dark:bg-[#303032] text-[#5e5e5e] dark:text-[#FFFFFFA6] text-2xl">
                    {getUserInitials(customer.profile)}
                  </AvatarFallback>
                </Avatar>
                {customer.onboarding_completed && (
                  <div className="absolute bottom-0 right-0 bg-white dark:bg-[#1e1e1e] rounded-full p-1">
                    <BadgeCheck className="w-5 h-5 text-blue-500" />
                  </div>
                )}
              </div>
              
              <div className="mt-4 space-y-1">
                <h2 className="text-2xl font-semibold">
                  {customer.profile?.display_name || 'Unnamed Customer'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {customer.profile?.email || 'No email provided'}
                </p>
              </div>
            </div>

            {/* Customer Type Tags */}
            <div className="flex gap-2 justify-center flex-wrap">
              <span className="px-3 py-1 text-sm rounded-full bg-[#f5f5f5] dark:bg-[#2a2a2a] text-[#666] dark:text-[#FFFFFFA6]">
                {customer.customer_type}
              </span>
              <span className="px-3 py-1 text-sm rounded-full bg-[#f5f5f5] dark:bg-[#2a2a2a] text-[#666] dark:text-[#FFFFFFA6]">
                {customer.subscription_plan || 'No Plan'}
              </span>
            </div>
          </div>

          {/* Details Sections */}
          <div className="border-t border-[#eaeaea] dark:border-[#2a2a2a]">
            <div className="px-6 py-4 space-y-6">
              <div>
                <h3 className="text-base font-medium text-[#1e293b] dark:text-[#FFFFFFA6] mb-3">
                  Account Details
                </h3>
                <div className="space-y-2">
                  <p className="text-sm flex justify-between">
                    <span className="text-[#1e293b] dark:text-[#FFFFFFA6]">Customer ID</span>
                    <span className="text-muted-foreground">{customer.id}</span>
                  </p>
                  <p className="text-sm flex justify-between">
                    <span className="text-[#1e293b] dark:text-[#FFFFFFA6]">Created</span>
                    <span className="text-muted-foreground">
                      {customer.created_at ? format(new Date(customer.created_at), 'PPP') : 'N/A'}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-base font-medium text-[#1e293b] dark:text-[#FFFFFFA6] mb-3">
                  Onboarding Status
                </h3>
                <div className="space-y-2">
                  <p className="text-sm flex justify-between">
                    <span className="text-[#1e293b] dark:text-[#FFFFFFA6]">Status</span>
                    <span className="text-muted-foreground">
                      {customer.onboarding_completed ? 'Completed' : 'In Progress'}
                    </span>
                  </p>
                  {!customer.onboarding_completed && (
                    <p className="text-sm flex justify-between">
                      <span className="text-[#1e293b] dark:text-[#FFFFFFA6]">Current Step</span>
                      <span className="text-muted-foreground">{customer.onboarding_step || 1}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
