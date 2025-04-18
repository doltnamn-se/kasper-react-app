
import { OnlineStatusIndicator, OfflineStatusIndicator, getDeviceIcon } from "../utils/deviceStatusUtils";

interface CustomerStatusCellProps {
  isOnline: boolean;
  deviceType: string | null;
}

export const CustomerStatusCell = ({ isOnline, deviceType }: CustomerStatusCellProps) => {
  return (
    <div className="flex items-center gap-2">
      {isOnline ? <OnlineStatusIndicator /> : <OfflineStatusIndicator />}
      {isOnline && deviceType && (
        <div className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6]">
          {getDeviceIcon(deviceType)}
        </div>
      )}
    </div>
  );
};
