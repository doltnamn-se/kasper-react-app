import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface IdVerification {
  id: string;
  customer_id: string;
  status: string;
  document_path: string | null;
  created_at: string;
}

export const IdVerificationSection = ({ customerId }: { customerId: string }) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [verification, setVerification] = useState<IdVerification | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchLatest = async () => {
      const { data, error } = await supabase
        .from('id_verifications')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) {
        console.error('Error loading id_verifications', error);
        return;
      }
      setVerification(data as IdVerification | null);
    };
    if (customerId) fetchLatest();
  }, [customerId]);

  const handleDownload = async () => {
    if (!verification?.document_path) return;
    setDownloading(true);
    try {
      const { data, error } = await supabase.storage
        .from('id_documents')
        .createSignedUrl(verification.document_path, 60);
      if (error) throw error;
      const url = data?.signedUrl;
      if (url) window.open(url, '_blank');
    } catch (e) {
      console.error('Download failed', e);
      toast({ title: 'Error', description: language === 'sv' ? 'Kunde inte hämta dokumentet.' : 'Failed to download document.', variant: 'destructive' });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-base font-medium">{language === 'sv' ? 'ID-intyg' : 'ID verification'}</h3>
      {!verification && (
        <p className="text-sm text-muted-foreground">{language === 'sv' ? 'Ingen begäran skapad ännu.' : 'No request created yet.'}</p>
      )}
      {verification && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-[#e5e7eb] dark:border-[#232325] bg-[#f9f9f9] dark:bg-[#1b1b1d]">
          <div>
            <p className="text-sm">{language === 'sv' ? 'Status' : 'Status'}: <span className="font-medium">{verification.status}</span></p>
            <p className="text-xs text-muted-foreground">{new Date(verification.created_at).toLocaleString()}</p>
          </div>
          <div>
            {verification.document_path ? (
              <Button variant="outline" size="sm" onClick={handleDownload} disabled={downloading}>
                <Download className="h-4 w-4 mr-2" /> {language === 'sv' ? 'Ladda ner' : 'Download'}
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">{language === 'sv' ? 'Ingen uppladdning ännu' : 'No upload yet'}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
