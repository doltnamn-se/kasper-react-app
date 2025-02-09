
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { CustomerWithProfile } from "@/types/customer";
import { format } from "date-fns";

interface CustomerDetailsSheetProps {
  customer: CustomerWithProfile | null;
  onOpenChange: (open: boolean) => void;
}

export const CustomerDetailsSheet = ({ customer, onOpenChange }: CustomerDetailsSheetProps) => {
  if (!customer) return null;

  return (
    <Sheet open={!!customer} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-xl w-full">
        <div className="space-y-6 py-6">
          <h2 className="text-2xl font-semibold">Customer Details</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Personal Information</h3>
              <div className="mt-2 space-y-2">
                <p className="text-sm">
                  <span className="text-muted-foreground">Display Name:</span>{" "}
                  {customer.profile?.display_name || 'No name provided'}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Email:</span>{" "}
                  {customer.profile?.email || 'No email provided'}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Created:</span>{" "}
                  {customer.created_at ? format(new Date(customer.created_at), 'PPP') : 'N/A'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium">Onboarding Status</h3>
              <div className="mt-2 space-y-2">
                <p className="text-sm">
                  <span className="text-muted-foreground">Status:</span>{" "}
                  {customer.onboarding_completed ? 'Completed' : 'In Progress'}
                </p>
                {!customer.onboarding_completed && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Current Step:</span>{" "}
                    {customer.onboarding_step || 1}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium">Subscription</h3>
              <div className="mt-2 space-y-2">
                <p className="text-sm">
                  <span className="text-muted-foreground">Plan:</span>{" "}
                  {customer.subscription_plan 
                    ? customer.subscription_plan.replace('_', ' ') 
                    : 'No active plan'}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Customer Type:</span>{" "}
                  <span className="capitalize">{customer.customer_type}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
