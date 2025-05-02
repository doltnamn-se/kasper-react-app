
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MonitoringUrl } from "@/types/monitoring-urls";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, parseISO } from "date-fns";
import { sv, enUS } from "date-fns/locale";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink } from "lucide-react";

interface AdminMonitoringUrlListProps {
  monitoringUrls: MonitoringUrl[];
  onUpdateStatus: (urlId: string, status: 'approved' | 'rejected', reason?: string) => Promise<void>;
}

export const AdminMonitoringUrlList = ({
  monitoringUrls,
  onUpdateStatus
}: AdminMonitoringUrlListProps) => {
  const { t, language } = useLanguage();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<MonitoringUrl | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [reason, setReason] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case 'approved':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case 'rejected':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return language === 'sv' ? 'Väntande' : 'Pending';
      case 'approved':
        return language === 'sv' ? 'Godkänd' : 'Approved';
      case 'rejected':
        return language === 'sv' ? 'Avvisad' : 'Rejected';
      default:
        return status;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(parseISO(dateString), {
        addSuffix: true,
        locale: language === 'sv' ? sv : enUS
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleActionClick = (url: MonitoringUrl, actionType: 'approve' | 'reject') => {
    setSelectedUrl(url);
    setAction(actionType);
    
    // Only show dialog for rejection to get reason
    if (actionType === 'reject') {
      setShowConfirmDialog(true);
    } else {
      // For approval, proceed directly
      handleConfirmAction();
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedUrl || !action) return;
    
    await onUpdateStatus(
      selectedUrl.id, 
      action, 
      action === 'reject' ? reason : undefined
    );
    
    setShowConfirmDialog(false);
    setSelectedUrl(null);
    setAction(null);
    setReason('');
  };

  const approveButtonText = language === 'sv' ? 'Godkänn' : 'Approve';
  const rejectButtonText = language === 'sv' ? 'Avvisa' : 'Reject';
  
  return (
    <>
      <div className="rounded-md border border-[#dfdfdf] dark:border-[#2e2e2e]">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f5f5f5] dark:bg-[#1c1c1e]">
              <TableHead>URL</TableHead>
              <TableHead>Kund</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tillagd</TableHead>
              <TableHead>Åtgärder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monitoringUrls.length > 0 ? (
              monitoringUrls.map((url) => (
                <TableRow key={url.id} className="border-b border-[#dfdfdf] dark:border-[#2e2e2e]">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <a 
                        href={url.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline max-w-[200px] truncate inline-flex items-center gap-1"
                      >
                        {url.url}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    {url.customer?.profiles?.display_name || url.customer?.profiles?.email || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(url.status)}>
                      {getStatusText(url.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatTime(url.created_at)}</TableCell>
                  <TableCell>
                    {url.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleActionClick(url, 'approve')}
                          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/40 dark:text-green-400 dark:border-green-800"
                        >
                          {approveButtonText}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleActionClick(url, 'reject')}
                          className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 dark:border-red-800"
                        >
                          {rejectButtonText}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-gray-500 dark:text-gray-400">
                  {language === 'sv' ? 'Inga bevaknings-URLs hittades' : 'No monitoring URLs found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'sv' ? 'Avvisa URL' : 'Reject URL'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">
              {language === 'sv' 
                ? 'Ange anledning till varför denna URL avvisas (valfritt):' 
                : 'Enter a reason why this URL is being rejected (optional):'}
            </p>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={language === 'sv' ? 'Anledning...' : 'Reason...'}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setShowConfirmDialog(false)}
              variant="outline"
            >
              {language === 'sv' ? 'Avbryt' : 'Cancel'}
            </Button>
            <Button 
              onClick={handleConfirmAction}
              variant="destructive"
            >
              {language === 'sv' ? 'Bekräfta avvisning' : 'Confirm rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
