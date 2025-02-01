import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { URLTableRow } from "./URLTableRow";

export const AdminDeindexingView = () => {
  const { t } = useLanguage();

  const { data: urls = [], refetch } = useQuery({
    queryKey: ['admin-urls'],
    queryFn: async () => {
      console.log('Fetching URLs for admin view');
      const { data, error } = await supabase
        .from('removal_urls')
        .select(`
          id,
          url,
          status,
          created_at,
          customer:customers (
            id,
            profiles (
              email
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

  // Set up real-time subscription for URL updates
  useEffect(() => {
    console.log('Setting up real-time subscription for URLs');
    const channel = supabase
      .channel('admin-urls-changes')
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
      .subscribe();

    return () => {
      console.log('Cleaning up URL subscription');
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const handleStatusChange = async (urlId: string, newStatus: string) => {
    try {
      console.log('Updating URL status:', { urlId, newStatus });
      
      const { error: updateError } = await supabase
        .from('removal_urls')
        .update({
          status: newStatus,
          status_history: supabase.rpc('append_status_history', {
            url_id: urlId,
            new_status: newStatus
          })
        })
        .eq('id', urlId);

      if (updateError) {
        console.error('Error updating URL status:', updateError);
        toast({
          title: "Error",
          description: "Failed to update URL status",
          variant: "destructive",
        });
        return;
      }

      console.log('URL status updated successfully');
      toast({
        title: "Success",
        description: "URL status updated successfully",
      });

      refetch();
    } catch (error) {
      console.error('Error in handleStatusChange:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('url')}</TableHead>
            <TableHead>{t('customer')}</TableHead>
            <TableHead>{t('submitted')}</TableHead>
            <TableHead>{t('status')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {urls.map((url) => (
            <URLTableRow
              key={url.id}
              url={url}
              onStatusChange={handleStatusChange}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};