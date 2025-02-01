import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const statusSteps = {
  received: 0,
  case_started: 1,
  request_submitted: 2,
  removal_approved: 3,
} as const;

type StatusStep = keyof typeof statusSteps;

export const AdminDeindexingView = () => {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();

  const { data: urls, isLoading } = useQuery({
    queryKey: ['admin-urls'],
    queryFn: async () => {
      console.log('Fetching all URLs for admin...');
      const { data, error } = await supabase
        .from('removal_urls')
        .select(`
          *,
          customers (
            id,
            profiles (
              email,
              display_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching URLs:', error);
        throw error;
      }

      console.log('Fetched URLs:', data);
      return data;
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({ urlId, newStatus }: { urlId: string, newStatus: StatusStep }) => {
      console.log('Updating URL status:', { urlId, newStatus });
      const { data, error } = await supabase
        .from('removal_urls')
        .update({ 
          current_status: newStatus,
          status_history: supabase.sql`array_append(COALESCE(status_history, ARRAY[]::jsonb[]), jsonb_build_object('status', ${newStatus}, 'timestamp', now()))`
        })
        .eq('id', urlId)
        .select()
        .single();

      if (error) {
        console.error('Error updating URL status:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-urls'] });
      toast({
        title: t('success'),
        description: language === 'sv' ? 'Status uppdaterad' : 'Status updated',
      });
    },
    onError: (error) => {
      console.error('Error in updateStatus mutation:', error);
      toast({
        title: t('error.title'),
        description: language === 'sv' ? 'Kunde inte uppdatera status' : 'Failed to update status',
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>URL</TableHead>
          <TableHead>{language === 'sv' ? 'Användare' : 'User'}</TableHead>
          <TableHead>{language === 'sv' ? 'Tillagd' : 'Submitted'}</TableHead>
          <TableHead>{language === 'sv' ? 'Status' : 'Status'}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {urls?.map((url) => (
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
              {url.customers?.profiles?.display_name || url.customers?.profiles?.email || 'N/A'}
            </TableCell>
            <TableCell>
              {new Date(url.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <Select
                value={url.current_status || 'received'}
                onValueChange={(value: StatusStep) => {
                  updateStatus.mutate({ urlId: url.id, newStatus: value });
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="received">
                    {language === 'sv' ? 'Mottagen' : 'Received'}
                  </SelectItem>
                  <SelectItem value="case_started">
                    {language === 'sv' ? 'Ärende påbörjat' : 'Case started'}
                  </SelectItem>
                  <SelectItem value="request_submitted">
                    {language === 'sv' ? 'Begäran inskickad' : 'Request submitted'}
                  </SelectItem>
                  <SelectItem value="removal_approved">
                    {language === 'sv' ? 'Borttagning godkänd' : 'Removal approved'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};