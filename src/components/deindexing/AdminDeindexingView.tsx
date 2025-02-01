import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { URLTableRow } from "./URLTableRow";
import type { StatusStep } from "./URLStatusSelect";

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
            profiles:profiles (
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
      
      // First, get the current status_history
      const { data: currentUrl, error: fetchError } = await supabase
        .from('removal_urls')
        .select('status_history')
        .eq('id', urlId)
        .single();

      if (fetchError) {
        console.error('Error fetching current URL:', fetchError);
        throw fetchError;
      }

      // Prepare the new status history entry
      const newHistoryEntry = {
        status: newStatus,
        timestamp: new Date().toISOString()
      };

      // Create the updated status_history array
      const updatedHistory = currentUrl.status_history || [];
      updatedHistory.push(newHistoryEntry);

      // Update the record with the new status and history
      const { data, error } = await supabase
        .from('removal_urls')
        .update({ 
          current_status: newStatus,
          status_history: updatedHistory
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
          <URLTableRow
            key={url.id}
            url={url}
            onStatusChange={(urlId, newStatus) => 
              updateStatus.mutate({ urlId, newStatus })
            }
            isLoading={updateStatus.isPending}
          />
        ))}
      </TableBody>
    </Table>
  );
};