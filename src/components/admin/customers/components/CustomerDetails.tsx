
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

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('toast.copied.title'),
      description: `${label} ${t('toast.copied.description')}`
    });
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <h2 className="text-xs font-semibold text-[#000000] dark:text-white">
          {customer.profile?.display_name || t('no.name')}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => handleCopy(customer.profile?.display_name || '', t('name'))}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-xs text-[#000000] dark:text-white">
          {customer.profile?.email || t('no.email')}
        </p>
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
  );
};
