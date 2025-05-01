
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { CustomerWithProfile } from "@/types/customer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";

interface CustomerDetailsProps {
  customer: CustomerWithProfile;
}

export const CustomerDetails = ({ customer }: CustomerDetailsProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();

  // Log the address for debugging
  console.log("Customer address in CustomerDetails:", customer.address);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('toast.copied.title'),
      description: `${label} ${t('toast.copied.description')}`
    });
  };

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

      <div className="space-y-1">
        <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">
          {t('address')}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#000000] dark:text-[#FFFFFF]">
            {typeof customer.address === 'string' && customer.address ? customer.address : t('no.address')}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => handleCopy(typeof customer.address === 'string' ? customer.address || '' : '', t('address'))}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
