
import { useAdminURLManagement } from "./hooks/useAdminURLManagement";
import { URLTable } from "./URLTable";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Fingerprint, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useCustomers } from "@/components/admin/customers/useCustomers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

export const AdminDeindexingView = () => {
  const { urls, handleStatusChange, handleDeleteUrl } = useAdminURLManagement();
  const { t, language } = useLanguage();
  const { customers, isLoading } = useCustomers();
  const isMobile = useIsMobile();

  const [open, setOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Log the number of URLs received for debugging
  useEffect(() => {
    console.log(`AdminDeindexingView: Received ${urls.length} URLs`);
  }, [urls.length]);

  const handleRequestVerification = async (customerId: string) => {
    try {
      setIsSending(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Failed to get current user', userError);
        toast.error(language === 'sv' ? 'Kunde inte hämta administratör' : 'Failed to get admin user');
        return;
      }

      const { error } = await supabase.rpc('request_id_verification', {
        p_customer_id: customerId,
        p_requested_by: user.id,
      });

      if (error) {
        console.error('request_id_verification error:', error);
        toast.error(language === 'sv' ? 'Misslyckades att skicka begäran' : 'Failed to send request');
        return;
      }

      toast.success(language === 'sv' ? 'Begäran skickad till kund' : 'Request sent to customer');
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(language === 'sv' ? 'Ett fel uppstod' : 'An error occurred');
    } finally {
      setIsSending(false);
    }
  };

  const PickerBody = (
    <Command>
      <CommandInput placeholder={language === 'sv' ? 'Sök kund...' : 'Search customer...'} />
      <CommandList>
        <CommandEmpty>{language === 'sv' ? 'Inga kunder hittades.' : 'No customers found.'}</CommandEmpty>
        <CommandGroup heading={language === 'sv' ? 'Kunder' : 'Customers'}>
          {isLoading ? (
            <div className="px-3 py-2 text-muted-foreground text-sm">
              {language === 'sv' ? 'Laddar kunder...' : 'Loading customers...'}
            </div>
          ) : (
            customers.map((c) => (
              <CommandItem
                key={c.id}
                value={`${c.profile?.display_name ?? ''} ${c.profile?.email ?? ''}`}
                onSelect={() => handleRequestVerification(c.id)}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{c.profile?.display_name ?? '—'}</span>
                  <span className="text-xs text-muted-foreground">{c.profile?.email}</span>
                </div>
              </CommandItem>
            ))
          )}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>{t('nav.admin.deindexing')}</h1>
        <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Fingerprint className="h-4 w-4" />}
          <span>{language === 'sv' ? 'Intyg' : 'Certificate'}</span>
        </Button>
      </div>

      {isMobile ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{language === 'sv' ? 'Begär ID-intyg' : 'Request ID verification'}</DrawerTitle>
              <DrawerDescription>
                {language === 'sv' ? 'Välj kund att skicka begäran till.' : 'Select a customer to send the request to.'}
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4">{PickerBody}</div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{language === 'sv' ? 'Begär ID-intyg' : 'Request ID verification'}</DialogTitle>
              <DialogDescription>
                {language === 'sv' ? 'Välj kund att skicka begäran till.' : 'Select a customer to send the request to.'}
              </DialogDescription>
            </DialogHeader>
            {PickerBody}
          </DialogContent>
        </Dialog>
      )}
      
      <URLTable 
        urls={urls} 
        onStatusChange={handleStatusChange} 
        onDelete={handleDeleteUrl}
      />
    </div>
  );
};
