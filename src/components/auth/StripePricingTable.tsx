
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface StripePricingTableProps {
  onBack: () => void;
}

export const StripePricingTable: React.FC<StripePricingTableProps> = ({ onBack }) => {
  const [loaded, setLoaded] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Load Stripe pricing table script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);

    return () => {
      // Clean up script if component unmounts
      try {
        const existingScript = document.querySelector('script[src="https://js.stripe.com/v3/pricing-table.js"]');
        if (existingScript && existingScript.parentNode) {
          existingScript.parentNode.removeChild(existingScript);
        }
      } catch (err) {
        console.error('Error removing Stripe script:', err);
      }
    };
  }, []);

  return (
    <div className="flex flex-col justify-center w-full fade-in">
      <div className="bg-transparent p-8 w-full max-w-md">
        {loaded ? (
          <>
            <div className="w-full overflow-y-auto mb-8 stripe-pricing-container">
              <stripe-pricing-table
                pricing-table-id="prctbl_1RNL4UIZ35LgEgXXDVnqnfev"
                publishable-key="pk_live_51QctIzIZ35LgEgXXQpIJbrbrFFyZiofeG7LcfUBRkVVEbLATz2XivpAVWnb0M8QVrj5fkXYOBQZavXbzzxoOdSpC008DG85HjM"
              >
              </stripe-pricing-table>
            </div>
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="text-sm"
              >
                {t('cancel')}
              </Button>
            </div>
          </>
        ) : (
          <div className="w-full flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </div>
  );
};
