
import React from "react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { StatusTable } from "./StatusTable";
import { siteConfig } from "./SiteConfig";
import { cn } from "@/lib/utils";
import { useMemberSiteStatuses } from "@/hooks/useMemberSiteStatuses";
import { useMemberGuideOpener } from "@/hooks/useMemberGuideOpener";

interface MemberStatusCardProps {
  customerId: string;
  memberId: string;
}

export const MemberStatusCard: React.FC<MemberStatusCardProps> = ({ customerId, memberId }) => {
  const { language } = useLanguage();
  const { siteStatuses, isLoading } = useMemberSiteStatuses(customerId, memberId);
  const { handleRemoveSite } = useMemberGuideOpener(customerId, memberId);

  return (
    <Card
      id="member-status-widget"
      className={cn(
        "bg-white dark:bg-[#1c1c1e] p-4 md:p-6 rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200",
        "transition-all duration-300"
      )}
    >
      <div>
        <h2>
          {language === 'sv' ? 'Status' : 'Status'}
        </h2>
        <p className="text-[#000000A6] dark:text-[#FFFFFFA6] font-medium text-sm mb-6 md:mb-10">
          {language === 'sv' ? 'Din synlighet på upplysningssidor' : 'Your visibility on search sites'}
        </p>
      </div>
      <div className="mt-2">
        <StatusTable
          siteStatuses={siteStatuses}
          sites={siteConfig}
          onRemoveSite={handleRemoveSite}
        />
      </div>
    </Card>
  );
};
