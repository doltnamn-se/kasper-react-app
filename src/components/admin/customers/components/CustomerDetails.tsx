
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

  // Inline styles for the check animation
  const checkmarkStyle = {
    animation: 'checkmark 0.3s ease-in-out forwards',
  };

  // Inline keyframes style to be injected once
  const keyframesStyle = `
    @keyframes checkmark {
      0% {
        stroke-dasharray: 0;
        stroke-dashoffset: 24;
        opacity: 0;
      }
      100% {
        stroke-dasharray: 24;
        stroke-dashoffset: 0;
        opacity: 1;
      }
    }
  `;

  return (
    <div className="space-y-4">
      {/* Inject the keyframes style */}
      <style>{keyframesStyle}</style>
      
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
                style={checkmarkStyle}
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth={2.5}
              />
            ) : (
              <Copy className={`h-4 w-4 ${fadeInActive['name'] ? 'animate-fade-in' : ''} ${fadeOutActive['name'] ? 'animate-fade-out' : ''}`} />
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
                style={checkmarkStyle}
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth={2.5}
              />
            ) : (
              <Copy className={`h-4 w-4 ${fadeInActive['email'] ? 'animate-fade-in' : ''} ${fadeOutActive['email'] ? 'animate-fade-out' : ''}`} />
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
                  style={checkmarkStyle}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth={2.5}
                />
              ) : (
                <Copy className={`h-4 w-4 ${fadeInActive['address'] ? 'animate-fade-in' : ''} ${fadeOutActive['address'] ? 'animate-fade-out' : ''}`} />
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
                style={checkmarkStyle}
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth={2.5}
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

