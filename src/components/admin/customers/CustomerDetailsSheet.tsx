
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { CustomerWithProfile } from "@/types/customer";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserInitials } from "@/utils/profileUtils";

interface CustomerDetailsSheetProps {
  customer: CustomerWithProfile | null;
  onOpenChange: (open: boolean) => void;
}

export const CustomerDetailsSheet = ({ customer, onOpenChange }: CustomerDetailsSheetProps) => {
  if (!customer) return null;

  return (
    <Sheet open={!!customer} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-xl w-full">
        <div className="space-y-8 py-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={customer.profile?.avatar_url} />
              <AvatarFallback className="bg-[#e8e8e8] dark:bg-[#303032] text-[#5e5e5e] dark:text-[#FFFFFFA6]">
                {getUserInitials(customer.profile)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">
                {customer.profile?.display_name || 'Unnamed Customer'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {customer.profile?.email || 'No email provided'}
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-[#1e293b] dark:text-[#FFFFFFA6]">
                Personal Information
              </h3>
              <div className="mt-3 space-y-3">
                <p className="text-sm">
                  <span className="text-[#1e293b] dark:text-[#FFFFFFA6]">Customer ID:</span>{" "}
                  <span className="text-muted-foreground">{customer.id}</span>
                </p>
                <p className="text-sm">
                  <span className="text-[#1e293b] dark:text-[#FFFFFFA6]">Customer Type:</span>{" "}
                  <span className="capitalize text-muted-foreground">{customer.customer_type}</span>
                </p>
                <p className="text-sm">
                  <span className="text-[#1e293b] dark:text-[#FFFFFFA6]">Created:</span>{" "}
                  <span className="text-muted-foreground">
                    {customer.created_at ? format(new Date(customer.created_at), 'PPP') : 'N/A'}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-[#1e293b] dark:text-[#FFFFFFA6]">
                Onboarding Status
              </h3>
              <div className="mt-3 space-y-3">
                <p className="text-sm">
                  <span className="text-[#1e293b] dark:text-[#FFFFFFA6]">Status:</span>{" "}
                  <span className="text-muted-foreground">
                    {customer.onboarding_completed ? 'Completed' : 'In Progress'}
                  </span>
                </p>
                {!customer.onboarding_completed && (
                  <p className="text-sm">
                    <span className="text-[#1e293b] dark:text-[#FFFFFFA6]">Current Step:</span>{" "}
                    <span className="text-muted-foreground">{customer.onboarding_step || 1}</span>
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-[#1e293b] dark:text-[#FFFFFFA6]">
                Subscription
              </h3>
              <div className="mt-3 space-y-3">
                <p className="text-sm">
                  <span className="text-[#1e293b] dark:text-[#FFFFFFA6]">Plan:</span>{" "}
                  <span className="text-muted-foreground">
                    {customer.subscription_plan 
                      ? customer.subscription_plan.replace('_', ' ') 
                      : 'No active plan'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
