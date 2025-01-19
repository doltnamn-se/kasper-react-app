import { CustomerWithProfile } from "@/types/customer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { format } from "date-fns";

interface CustomerDetailsProps {
  customer: CustomerWithProfile;
}

export const CustomerDetails = ({ customer }: CustomerDetailsProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Personal Information</h3>
              <div className="mt-2 space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Display Name:</span>{" "}
                  {customer.profile?.display_name || 'No name provided'}
                </p>
                <p>
                  <span className="text-muted-foreground">Created:</span>{" "}
                  {customer.created_at ? format(new Date(customer.created_at), 'PPP') : 'N/A'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-medium">Onboarding Status</h3>
              <div className="mt-2 space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  {customer.onboarding_completed ? 'Completed' : 'In Progress'}
                </p>
                {!customer.onboarding_completed && (
                  <p>
                    <span className="text-muted-foreground">Current Step:</span>{" "}
                    {customer.onboarding_step || 1}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium">Subscription</h3>
              <div className="mt-2 space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Plan:</span>{" "}
                  {customer.subscription_plan ? customer.subscription_plan.replace('_', ' ') : 'No active plan'}
                </p>
                {customer.stripe_customer_id && (
                  <p>
                    <span className="text-muted-foreground">Stripe ID:</span>{" "}
                    {customer.stripe_customer_id}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};