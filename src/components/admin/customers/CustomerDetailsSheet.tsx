
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CustomerWithProfile } from "@/types/customer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useCustomerPresence } from "./useCustomerPresence";
import { useCustomerData } from "./hooks/useCustomerData";
import { CustomerAvatar } from "./components/CustomerAvatar";
import { CustomerDetails } from "./components/CustomerDetails";
import { CustomerBadges } from "./components/CustomerBadges";
import { AccountInfo } from "./components/AccountInfo";
import { UrlSubmissions } from "./components/UrlSubmissions";
import { ChecklistProgress } from "./components/ChecklistProgress";
import { AdminUrlSubmission } from "./components/AdminUrlSubmission";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import { generatePassword } from "../../../supabase/functions/_shared/passwordGenerator";

interface CustomerDetailsSheetProps {
  customer: CustomerWithProfile | null;
  onOpenChange: (open: boolean) => void;
}

export const CustomerDetailsSheet = ({ customer, onOpenChange }: CustomerDetailsSheetProps) => {
  const { onlineUsers, lastSeen } = useCustomerPresence();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { data: customerData, isLoading } = useCustomerData(customer);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [additionalUrls, setAdditionalUrls] = useState<string>("");

  // Fetch current URL limits
  const { data: urlLimits, refetch: refetchUrlLimits } = useQuery({
    queryKey: ['url-limits', customer?.id],
    queryFn: async () => {
      if (!customer?.id) return null;
      const { data, error } = await supabase
        .from('user_url_limits')
        .select('additional_urls')
        .eq('customer_id', customer.id)
        .maybeSingle();
      
      if (error) throw error;
      if (data) setAdditionalUrls(data.additional_urls.toString());
      return data;
    },
    enabled: !!customer?.id
  });

  useEffect(() => {
    const checkSuperAdmin = async () => {
      const { data, error } = await supabase.rpc('is_super_admin');
      if (!error && data) {
        setIsSuperAdmin(data);
      }
    };
    checkSuperAdmin();
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('toast.copied.title'),
      description: `${label} ${t('toast.copied.description')}`
    });
  };

  const handleUpdateUrlLimits = async () => {
    if (!customer?.id) return;
    
    try {
      setIsUpdating(true);
      const numericValue = parseInt(additionalUrls);
      
      if (isNaN(numericValue)) {
        toast({
          title: "Error",
          description: "Please enter a valid number",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('user_url_limits')
        .update({ additional_urls: numericValue })
        .eq('customer_id', customer.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "URL limits updated successfully"
      });
      refetchUrlLimits();
    } catch (error) {
      console.error("Error updating URL limits:", error);
      toast({
        title: "Error",
        description: "Failed to update URL limits",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResendActivationEmail = async () => {
    if (!customer?.id || !customer.profile?.email || !customer.profile?.display_name) return;
    
    try {
      setIsSendingEmail(true);
      const generatedPassword = generatePassword();
      
      // Send activation email
      const { error: emailError } = await supabase.functions.invoke('send-activation-email', {
        body: {
          email: customer.profile.email,
          displayName: customer.profile.display_name,
          password: generatedPassword
        }
      });

      if (emailError) throw emailError;

      toast({
        title: "Success",
        description: "Activation email sent successfully"
      });
    } catch (error) {
      console.error("Error sending activation email:", error);
      toast({
        title: "Error",
        description: "Failed to send activation email",
        variant: "destructive"
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (!customer) return null;

  const isOnline = customer.id ? onlineUsers.has(customer.id) : false;
  const userLastSeen = customer.id ? lastSeen[customer.id] : null;

  // Calculate URL usage
  const usedUrls = customerData?.urls?.length || 0;
  const totalUrlLimit = (customerData?.limits?.additional_urls || 0);

  // Calculate checklist progress based on completed_at field
  const checklistProgress = customerData?.checklistProgress;
  console.log('Checklist Progress Data:', checklistProgress);

  // If completed_at exists, the checklist is completed (100%)
  const progressPercentage = checklistProgress?.completed_at ? 100 : 0;
  const completedSteps = checklistProgress?.completed_at ? 4 : 0;
  const totalSteps = 4;

  console.log('Progress based on completed_at:', {
    progressPercentage,
    completedSteps,
    completed_at: checklistProgress?.completed_at
  });

  if (isLoading) {
    return (
      <Sheet open={!!customer} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="sm:max-w-xl w-full p-0">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={!!customer} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-xl w-full p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-6 py-6">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center">
                  <CustomerAvatar customer={customer} progressPercentage={progressPercentage} />
                  <CustomerDetails customer={customer} />
                </div>
                <CustomerBadges customer={customer} />
              </div>

              <div className="border-t border-[#eaeaea] dark:border-[#2e2e2e]">
                <div className="py-4 space-y-6">
                  <AccountInfo 
                    customer={customer}
                    isOnline={isOnline}
                    userLastSeen={userLastSeen}
                    onCopy={handleCopy}
                  />
                  
                  {isSuperAdmin && (
                    <Button
                      onClick={handleResendActivationEmail}
                      disabled={isSendingEmail}
                      variant="outline"
                      className="w-full"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {isSendingEmail ? "Sending..." : "Resend Activation Email"}
                    </Button>
                  )}

                  <UrlSubmissions usedUrls={usedUrls} totalUrlLimit={totalUrlLimit} />
                  
                  {isSuperAdmin && (
                    <div>
                      <h3 className="text-base font-medium text-[#000000] dark:text-[#FFFFFFA6] mb-3">
                        URL Limits
                      </h3>
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
                  )}
                  
                  {isSuperAdmin && <AdminUrlSubmission customerId={customer.id} />}
                  <ChecklistProgress 
                    progressPercentage={progressPercentage}
                    completedSteps={completedSteps}
                    totalSteps={totalSteps}
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
