import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect } from "react";

const statusSteps = {
  received: 0,
  case_started: 1,
  request_submitted: 2,
  removal_approved: 3,
} as const;

const StatusStepper = ({ currentStatus }: { currentStatus: keyof typeof statusSteps }) => {
  const { language } = useLanguage();
  const currentStep = statusSteps[currentStatus];

  const steps = [
    { key: 'received', label: language === 'sv' ? 'Mottagen' : 'Received' },
    { key: 'case_started', label: language === 'sv' ? 'Ärende påbörjat' : 'Case started' },
    { key: 'request_submitted', label: language === 'sv' ? 'Begäran inskickad' : 'Request submitted' },
    { key: 'removal_approved', label: language === 'sv' ? 'Borttagning godkänd' : 'Removal approved' },
  ];

  return (
    <div className="flex items-center space-x-2">
      {steps.map((step, index) => {
        const isCompleted = statusSteps[currentStatus] >= index;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.key} className="flex items-center">
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full ${
                isCompleted
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              }`}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="text-xs">{index + 1}</span>
              )}
            </div>
            {!isLast && (
              <ChevronRight
                className={`w-4 h-4 ${
                  statusSteps[currentStatus] > index
                    ? 'text-black dark:text-white'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export const IncomingLinks = () => {
  const { t, language } = useLanguage();

  const { data: incomingUrls, isLoading, refetch } = useQuery({
    queryKey: ['incoming-urls'],
    queryFn: async () => {
      console.log('Fetching incoming URLs...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user session');

      const { data, error } = await supabase
        .from('removal_urls')
        .select('*')
        .eq('customer_id', session.user.id)
        .eq('display_in_incoming', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching incoming URLs:', error);
        throw error;
      }

      console.log('Fetched incoming URLs:', data);
      return data;
    }
  });

  useEffect(() => {
    console.log('Setting up real-time subscription for incoming URLs');
    const channel = supabase
      .channel('incoming-urls-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'removal_urls'
        },
        (payload) => {
          console.log('URL change detected:', payload);
          refetch();
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status for incoming URLs:', status);
      });

    return () => {
      console.log('Cleaning up incoming URLs subscription');
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (!incomingUrls?.length) {
    return (
      <p className="text-[#000000A6] dark:text-[#FFFFFFA6] text-sm font-medium">
        {t('deindexing.no.incoming.links')}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>URL</TableHead>
          <TableHead>{language === 'sv' ? 'Tillagd' : 'Submitted'}</TableHead>
          <TableHead>{language === 'sv' ? 'Status' : 'Status'}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {incomingUrls.map((url) => (
          <TableRow key={url.id}>
            <TableCell className="font-medium">
              <a 
                href={url.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {url.url}
              </a>
            </TableCell>
            <TableCell>
              {new Date(url.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <StatusStepper currentStatus={url.current_status || 'received'} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};