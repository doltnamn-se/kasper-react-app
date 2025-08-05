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
import { useIsMobile } from "@/hooks/use-mobile";

export const KasperFriendsCard = () => {
  const { language } = useLanguage();
  const { userProfile } = useUserProfile();
  const { toast } = useToast();
  const isMobile = useIsMobile();

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

  // Fetch usage count from promotional_codes table
  const { data: usageData } = useQuery({
    queryKey: ['coupon-usage', customerData?.coupon_code],
    queryFn: async () => {
      if (!customerData?.coupon_code) return { usage_count: 0 };
      
      const { data, error } = await supabase
        .from('promotional_codes')
        .select('usage_count')
        .eq('code', customerData.coupon_code)
        .maybeSingle(); // Use maybeSingle() to handle cases where no record is found
      
      if (error) {
        console.error('Error fetching coupon usage:', error);
        return { usage_count: 0 };
      }
      
      // If no promotional code record found, return 0
      if (!data) {
        console.log('No promotional code record found for:', customerData.coupon_code);
        return { usage_count: 0 };
      }
      
      return data;
    },
    enabled: !!customerData?.coupon_code
  });

  const discountAmount = (usageData?.usage_count || 0) * 50;
  const circleRotation = (usageData?.usage_count || 0) * 30; // 30 degrees per usage

  // Debug logging
  console.log('KasperFriendsCard Debug:', {
    userProfile: userProfile?.id,
    customerData: customerData?.coupon_code,
    usageData: usageData?.usage_count,
    discountAmount,
    circleRotation
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

  const handleShareCode = () => {
    if (!customerData?.coupon_code) return;

    const shareText = `Skaffa Kasper med min kod '${customerData.coupon_code}' så får vi båda 50 kr rabatt. Följ länken: https://joinkasper.com/#planer`;
    
    if (isMobile && navigator.share) {
      // Mobile: Use native share
      navigator.share({
        title: 'Kasper Friends',
        text: shareText,
      });
    } else {
      // Desktop: Open email client
      const subject = encodeURIComponent('Kasper Friends - 50 kr rabatt');
      const body = encodeURIComponent(shareText);
      const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
      window.location.href = mailtoLink;
    }
  };

  return (
    <Card 
      className={cn(
        "bg-white dark:bg-[#1c1c1e] p-4 md:p-6 pb-8 md:pb-10 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200"
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

        <div className="flex flex-col items-center py-8">
          <p className={`text-sm md:text-base font-medium mb-2 ${
            discountAmount > 0 
              ? 'text-[#097c4f]' 
              : 'text-[#000000A6] dark:text-[#FFFFFFA6]'
          }`}>
            -{discountAmount} kr
          </p>
          <div className="relative w-52 h-52 rounded-full shadow-lg" style={{ backgroundColor: '#24cc5b', boxShadow: '0 8px 24px rgba(36, 204, 91, 0.25)' }}>
            <div 
              className="absolute inset-0 rounded-full transition-transform duration-1000 ease-in-out"
              style={{
                background: `conic-gradient(from 0deg, #097c4f 0deg, #097c4f ${circleRotation}deg, transparent ${circleRotation}deg)`
              }}
            ></div>
          </div>
          <p className="text-sm md:text-base font-medium text-[#000000A6] dark:text-[#FFFFFFA6] text-center mt-4 max-w-xs">
            {language === 'sv' 
              ? 'När någon skaffar Kasper med din kod får ni båda 50 kr rabatt på ert abonnemang'
              : 'When someone gets Kasper with your code, you both get 50 SEK off your subscription'
            }
          </p>
        </div>

        {customerData?.coupon_code ? (
          <div className="space-y-3">
            <div 
              className="bg-[#f4f4f4] dark:bg-[#161618] p-3 flex items-center justify-between"
              style={{ borderRadius: 'calc(var(--radius) - 1px)' }}
            >
              <div>
                <p className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6]">
                  {language === 'sv' ? 'Din personliga kod' : 'Your personal code'}
                </p>
                <span className="text-base font-semibold text-[#000000] dark:text-[#FFFFFF]">
                  {customerData.coupon_code}
                </span>
              </div>
              <Button 
                onClick={handleCopyCoupon}
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
              >
                <Copy className="h-5 w-5" />
              </Button>
            </div>
            {isMobile && (
              <Button 
                variant="default"
                className="w-full text-sm md:text-base mb-4"
                onClick={handleShareCode}
              >
                {language === 'sv' ? 'Dela din kod' : 'Share your code'}
              </Button>
            )}
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