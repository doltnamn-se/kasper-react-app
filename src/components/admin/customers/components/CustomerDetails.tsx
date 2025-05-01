
import { Button } from "@/components/ui/button";
import { Copy, MapPin } from "lucide-react";
import { CustomerWithProfile } from "@/types/customer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { useCustomerData } from "../hooks/useCustomerData";
import { useEffect } from "react";

interface CustomerDetailsProps {
  customer: CustomerWithProfile;
}

export const CustomerDetails = ({ customer }: CustomerDetailsProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { data, isLoading, error } = useCustomerData(customer.id);

  // Debug log when data changes
  useEffect(() => {
    console.log('CustomerDetails: Customer ID:', customer.id);
    console.log('CustomerDetails: Data received:', data);
    console.log('CustomerDetails: Address value:', data?.checklistProgress?.address);
    console.log('CustomerDetails: Loading status:', isLoading);
    if (error) console.error('CustomerDetails: Error fetching data:', error);
  }, [data, isLoading, error, customer.id]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('toast.copied.title'),
      description: `${label} ${t('toast.copied.description')}`
    });
  };

  // Get address from customer data
  const address = data?.checklistProgress?.address || '';

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">
          {t('name')}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#000000] dark:text-[#FFFFFF]">
            {customer.profile?.display_name || t('no.name')}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => handleCopy(customer.profile?.display_name || '', t('name'))}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-1">
        <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">
          {t('email')}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#000000] dark:text-[#FFFFFF]">
            {customer.profile?.email || t('no.email')}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => handleCopy(customer.profile?.email || '', t('email'))}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Address section */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">
          Address
        </p>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <span className="text-xs text-[#000000] dark:text-[#FFFFFF]">Loading address...</span>
          ) : (
            <>
              <span className="text-xs text-[#000000] dark:text-[#FFFFFF]">
                {address || 'No address provided'}
              </span>
              {address && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleCopy(address, 'Address')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
