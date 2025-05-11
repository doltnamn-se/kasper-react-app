
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface StripePricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StripePricingModal: React.FC<StripePricingModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Load Stripe pricing table script when the modal opens
    if (isOpen && !loaded) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/pricing-table.js';
      script.async = true;
      script.onload = () => setLoaded(true);
      document.body.appendChild(script);

      return () => {
        // Cleanup if needed
      };
    }
  }, [isOpen, loaded]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        {loaded && (
          // @ts-ignore - The stripe-pricing-table is a custom element provided by Stripe's script
          <stripe-pricing-table
            pricing-table-id="prctbl_1RNL4UIZ35LgEgXXDVnqnfev"
            publishable-key="pk_live_51QctIzIZ35LgEgXXQpIJbrbrFFyZiofeG7LcfUBRkVVEbLATz2XivpAVWnb0M8QVrj5fkXYOBQZavXbzzxoOdSpC008DG85HjM"
          >
          </stripe-pricing-table>
        )}
      </DialogContent>
    </Dialog>
  );
};
