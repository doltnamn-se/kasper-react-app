
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
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface CustomerDetailsProps {
  customer: CustomerWithProfile;
}

export const CustomerDetails = ({ customer }: CustomerDetailsProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [additionalUrls, setAdditionalUrls] = useState<string>("");

  // Fetch current URL limits
  const { data: urlLimits, refetch: refetchUrlLimits } = useQuery({
    queryKey: ['url-limits', customer.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_url_limits')
        .select('additional_urls')
        .eq('customer_id', customer.id)
        .single();
      
      if (error) throw error;
      setAdditionalUrls(data.additional_urls.toString());
      return data;
    }
  });

  const handleUpdateUrlLimits = async () => {
    try {
      setIsUpdating(true);
      const numericValue = parseInt(additionalUrls);
      
      if (isNaN(numericValue)) {
        toast.error("Please enter a valid number");
        return;
      }

      const { error } = await supabase
        .from('user_url_limits')
        .update({ additional_urls: numericValue })
        .eq('customer_id', customer.id);

      if (error) throw error;

      toast.success("URL limits updated successfully");
      refetchUrlLimits();
    } catch (error) {
      console.error("Error updating URL limits:", error);
      toast.error("Failed to update URL limits");
    } finally {
      setIsUpdating(false);
    }
  };

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
              <h3 className="font-medium">URL Limits</h3>
              <div className="mt-2 space-y-2">
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    value={additionalUrls}
                    onChange={(e) => setAdditionalUrls(e.target.value)}
                    className="w-24"
                    min="0"
                  />
                  <Button 
                    onClick={handleUpdateUrlLimits}
                    disabled={isUpdating || additionalUrls === urlLimits?.additional_urls?.toString()}
                    size="sm"
                  >
                    {isUpdating ? "Updating..." : "Update"}
                  </Button>
                </div>
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
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
