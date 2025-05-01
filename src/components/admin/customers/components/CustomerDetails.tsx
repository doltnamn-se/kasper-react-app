
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { CustomerWithProfile } from "@/types/customer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

interface CustomerDetailsProps {
  customer: CustomerWithProfile;
  onCopy?: (text: string, label: string) => void;
}

export const CustomerDetails = ({ customer, onCopy }: CustomerDetailsProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({});

  const handleCopy = (text: string, label: string, fieldId: string) => {
    // First set copied state to true to immediately show checkmark
    setCopiedFields(prev => ({ ...prev, [fieldId]: true }));
    
    // Continue with the copy operation
    if (onCopy) {
      onCopy(text, label);
    } else {
      navigator.clipboard.writeText(text);
      toast({
        title: t('toast.copied.title'),
        description: `${label} ${t('toast.copied.description')}`
      });
    }
    
    // Reset after animation completes
    setTimeout(() => {
      setCopiedFields(prev => ({ ...prev, [fieldId]: false }));
    }, 1500);
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
            className="h-6 w-6 bg-transparent hover:bg-transparent text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF]"
            onClick={() => handleCopy(customer.profile?.display_name || '', t('name'), 'name')}
          >
            {copiedFields['name'] ? (
              <Check 
                className="h-4 w-4 text-green-500" 
                style={{
                  strokeDasharray: 24,
                  animation: "drawCheck 0.3s ease-in-out forwards",
                }}
              />
            ) : (
              <Copy className="h-4 w-4" />
            )}
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
            className="h-6 w-6 bg-transparent hover:bg-transparent text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF]"
            onClick={() => handleCopy(customer.profile?.email || '', t('email'), 'email')}
          >
            {copiedFields['email'] ? (
              <Check 
                className="h-4 w-4 text-green-500" 
                style={{
                  strokeDasharray: 24,
                  animation: "drawCheck 0.3s ease-in-out forwards",
                }}
              />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {customer.profile?.address && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">
            {t('address')}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#000000] dark:text-[#FFFFFF]">
              {customer.profile.address}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 bg-transparent hover:bg-transparent text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF]"
              onClick={() => handleCopy(customer.profile.address || '', t('address'), 'address')}
            >
              {copiedFields['address'] ? (
                <Check 
                  className="h-4 w-4 text-green-500" 
                  style={{
                    strokeDasharray: 24,
                    animation: "drawCheck 0.3s ease-in-out forwards",
                  }}
                />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
      
      <div className="space-y-1">
        <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">{t('customer.id')}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#000000] dark:text-[#FFFFFF]">{customer.id}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 bg-transparent hover:bg-transparent text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF]"
            onClick={() => handleCopy(customer.id, t('customer.id'), 'customer-id')}
          >
            {copiedFields['customer-id'] ? (
              <Check 
                className="h-4 w-4 text-green-500" 
                style={{
                  strokeDasharray: 24,
                  animation: "drawCheck 0.3s ease-in-out forwards",
                }}
              />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <style>
        {`
        @keyframes drawCheck {
          0% {
            stroke-dashoffset: 24;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        `}
      </style>
    </div>
  );
};
