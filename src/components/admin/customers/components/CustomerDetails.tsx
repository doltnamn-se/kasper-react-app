
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
  const [fadeInActive, setFadeInActive] = useState<Record<string, boolean>>({});
  const [fadeOutActive, setFadeOutActive] = useState<Record<string, boolean>>({});

  const handleCopy = (text: string, label: string, fieldId: string) => {
    // First trigger fade out animation
    setFadeOutActive(prev => ({ ...prev, [fieldId]: true }));
    
    // After fade out completes, show the checkmark
    setTimeout(() => {
      setFadeOutActive(prev => ({ ...prev, [fieldId]: false }));
      
      // Continue with the copy operation
      if (onCopy) {
        onCopy(text, label);
        showCopiedAnimation(fieldId);
        return;
      }
      
      navigator.clipboard.writeText(text);
      toast({
        title: t('toast.copied.title'),
        description: `${label} ${t('toast.copied.description')}`
      });
      
      showCopiedAnimation(fieldId);
    }, 200); // Match this with the fade-out animation duration
  };

  const showCopiedAnimation = (fieldId: string) => {
    // Set copied state to true to show checkmark
    setCopiedFields(prev => ({ ...prev, [fieldId]: true }));
    
    // After animation, set fade-in state to true
    setTimeout(() => {
      setCopiedFields(prev => ({ ...prev, [fieldId]: false }));
      setFadeInActive(prev => ({ ...prev, [fieldId]: true }));
      
      // Reset fade-in state after animation completes
      setTimeout(() => {
        setFadeInActive(prev => ({ ...prev, [fieldId]: false }));
      }, 300);
    }, 1000); // Reduced from 1500ms to 1000ms to match faster animation
  };

  return (
    <div className="space-y-4">
      {/* Removed name field */}
      
      <div className="space-y-1">
        <p className="text-xs font-normal text-[#000000] dark:text-[#FFFFFF]">
          {t('email')}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">
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
                className="h-4 w-4 text-green-500 animate-draw-check [stroke-dasharray:24] [stroke-linecap:round] [stroke-linejoin:round]" 
                style={{ strokeDashoffset: 0 }}
              />
            ) : (
              <Copy className={`h-4 w-4 ${fadeInActive['email'] ? 'animate-fade-in' : ''} ${fadeOutActive['email'] ? 'animate-fade-out' : ''}`} />
            )}
          </Button>
        </div>
      </div>

      {customer.profile?.address && (
        <div className="space-y-1">
          <p className="text-xs font-normal text-[#000000] dark:text-[#FFFFFF]">
            {t('address')}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">
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
                  className="h-4 w-4 text-green-500 animate-draw-check [stroke-dasharray:24] [stroke-linecap:round] [stroke-linejoin:round]" 
                  style={{ strokeDashoffset: 0 }}
                />
              ) : (
                <Copy className={`h-4 w-4 ${fadeInActive['address'] ? 'animate-fade-in' : ''} ${fadeOutActive['address'] ? 'animate-fade-out' : ''}`} />
              )}
            </Button>
          </div>
        </div>
      )}
      
      <div className="space-y-1">
        <p className="text-xs font-normal text-[#000000] dark:text-[#FFFFFF]">{t('customer.id')}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">{customer.id}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 bg-transparent hover:bg-transparent text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF]"
            onClick={() => handleCopy(customer.id, t('customer.id'), 'customer-id')}
          >
            {copiedFields['customer-id'] ? (
              <Check 
                className="h-4 w-4 text-green-500 animate-draw-check [stroke-dasharray:24] [stroke-linecap:round] [stroke-linejoin:round]" 
                style={{ strokeDashoffset: 0 }}
              />
            ) : (
              <Copy className={`h-4 w-4 ${fadeInActive['customer-id'] ? 'animate-fade-in' : ''} ${fadeOutActive['customer-id'] ? 'animate-fade-out' : ''}`} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
