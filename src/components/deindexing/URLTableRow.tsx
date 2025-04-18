
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { URLStatusSelect } from "./URLStatusSelect";
import { getStatusText } from "./utils/statusUtils";

interface URLTableRowProps {
  url: {
    id: string;
    url: string;
    status: string;
    created_at: string;
    status_history?: {
      status: string;
      timestamp: string;
    }[];
    customer: {
      id: string;
      profiles: {
        email: string;
      };
    };
  };
  onStatusChange: (urlId: string, newStatus: string) => void;
  onDelete: (urlId: string) => void;
}

export const URLTableRow = ({ url, onStatusChange, onDelete }: URLTableRowProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs md:text-sm text-black dark:text-white capitalize">
        {getStatusText(url.status, t)}
      </span>
      <div className="flex items-center gap-2">
        <URLStatusSelect
          currentStatus={url.status}
          urlId={url.id}
          customerId={url.customer.id}
          onStatusChange={(newStatus) => onStatusChange(url.id, newStatus)}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(url.id)}
          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
