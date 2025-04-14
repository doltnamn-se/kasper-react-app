
import { useLanguage } from "@/contexts/LanguageContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { SubscriptionBarChart } from "./subscription/SubscriptionBarChart";
import { TimeRangeDropdown } from "./subscription/TimeRangeDropdown";
import { useSubscriptionFormatter, SubscriptionData } from "./subscription/subscriptionUtils";

// Define TimeRange type to match the one in AdminDashboard
type TimeRange = 'alltime' | 'ytd' | 'mtd' | '1year' | '4weeks' | '1week';

interface SubscriptionDistributionCardProps {
  subscriptionData: SubscriptionData[];
  timeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
}

export const SubscriptionDistributionCard = ({ 
  subscriptionData,
  timeRange = 'alltime',
  onTimeRangeChange
}: SubscriptionDistributionCardProps) => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const { processSubscriptionData } = useSubscriptionFormatter();
  
  // Process subscription data for the chart
  const { data, total } = processSubscriptionData(subscriptionData);

  // Calculate chart width for mobile - set fixed width for scrolling
  const chartWidth = isMobile ? 600 : '100%';

  // Time range dropdown
  const timeRangeDropdown = onTimeRangeChange ? (
    <TimeRangeDropdown timeRange={timeRange} onTimeRangeChange={onTimeRangeChange} />
  ) : null;

  return (
    <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200 h-[280px] flex flex-col">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
        <h3 className="text-sm font-medium">
          {t('subscription.distribution')}
        </h3>
        {timeRangeDropdown}
      </div>
      <div className="p-0 flex-1 overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="text-2xl font-bold">
            {total}
          </div>
          
          <div className="mt-6 flex-1 overflow-hidden">
            {isMobile ? (
              <ScrollArea className="h-[180px] w-full overflow-hidden">
                <div style={{ width: `${chartWidth}px`, height: '180px' }}>
                  <SubscriptionBarChart data={data} isMobile={isMobile} chartWidth={chartWidth} />
                </div>
              </ScrollArea>
            ) : (
              <div className="h-[180px]">
                <SubscriptionBarChart data={data} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
