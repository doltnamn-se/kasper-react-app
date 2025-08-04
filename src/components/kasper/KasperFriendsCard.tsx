import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export const KasperFriendsCard = () => {
  const { language } = useLanguage();
  const { userProfile } = useUserProfile();
  const { toast } = useToast();

  const { data: customerData } = useQuery({
    queryKey: ['customer-coupon', userProfile?.id],
    queryFn: async () => {
      if (!userProfile?.id) return null;
      const { data, error } = await supabase
        .from('customers')
        .select('coupon_code')
        .eq('id', userProfile.id)
        .single();
      
      if (error) {
        console.error('Error fetching customer coupon:', error);
        return null;
      }
      return data;
    },
    enabled: !!userProfile?.id
  });

  const handleCopyCoupon = async () => {
    if (customerData?.coupon_code) {
      try {
        await navigator.clipboard.writeText(customerData.coupon_code);
        toast({
          title: language === 'sv' ? "Kopierat!" : "Copied!",
          description: language === 'sv' ? "Kupongkoden har kopierats till urklipp" : "Coupon code copied to clipboard",
        });
      } catch (err) {
        toast({
          title: language === 'sv' ? "Fel" : "Error",
          description: language === 'sv' ? "Kunde inte kopiera kupongkoden" : "Failed to copy coupon code",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card 
      className={cn(
        "bg-white dark:bg-[#1c1c1e] p-4 md:p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200"
      )}
    >
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-[#000000] dark:text-[#FFFFFF]">
            Kasper Friends
          </h2>
          <p className="text-[#000000A6] dark:text-[#FFFFFFA6] font-medium text-sm">
            {language === 'sv' ? 'Sänk priset på ditt abonnemang' : 'Lower the price of your subscription'}
          </p>
        </div>

        {customerData?.coupon_code ? (
          <div className="space-y-3">
            <div className="bg-[#f8f9fa] dark:bg-[#2d2d2d] p-3 rounded-md border border-[#e5e7eb] dark:border-[#3d3d3d]">
              <p className="text-sm text-[#000000A6] dark:text-[#FFFFFFA6] mb-1">
                {language === 'sv' ? 'Din personliga kod' : 'Your personal code'}
              </p>
              <code className="text-lg font-semibold text-[#000000] dark:text-[#FFFFFF]">
                {customerData.coupon_code}
              </code>
            </div>
            
            <Button 
              onClick={handleCopyCoupon}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              {language === 'sv' ? 'Kopiera kod' : 'Copy code'}
            </Button>
            
            <p className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6]">
              {language === 'sv' 
                ? 'Dela denna kod med vänner för att ge dem rabatt på sin prenumeration.'
                : 'Share this code with friends to give them a discount on their subscription.'
              }
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-[#000000A6] dark:text-[#FFFFFFA6]">
              {language === 'sv' 
                ? 'Ingen kupongkod tillgänglig än.'
                : 'No coupon code available yet.'
              }
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};