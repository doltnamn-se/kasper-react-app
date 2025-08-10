import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Info, Upload } from "lucide-react";
import { usePendingIdVerification, IdVerification } from "@/components/id/hooks/usePendingIdVerification";


export const IdVerificationCard = () => {
  const { userProfile } = useUserProfile();
  const { language } = useLanguage();
  const { toast } = useToast();
  const { pending, setPending } = usePendingIdVerification();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const tText = useMemo(() => ({
    title: language === 'sv' ? 'ID verifiering krävs' : 'ID verification required',
    description: language === 'sv'
      ? 'För borttagning av länkar på Bing krävs det att man styker sin identitet med kopia på ID-handling. För att vi ska skicka en legal begäran för borttagning av dina länkar på Bing behöver du dela en fotokopia av antingen ditt pass eller id-kort.'
      : 'To remove links on Bing, you must provide proof of your identity with a copy of your ID. In order for us to send a legal request to remove your links on Bing, you will need to share a photocopy of either your passport or ID card.',
    selectFile: language === 'sv' ? 'Tillåten filtyp är PDF/PNG/JPG, max 5 MB' : 'Allowed file type is PDF/PNG/JPG, max 5 MB',
    choose: language === 'sv' ? 'Välj fil' : 'Choose file',
    noFile: language === 'sv' ? 'Ingen fil vald' : 'No file chosen',
    upload: language === 'sv' ? 'Ladda upp' : 'Upload',
    thankYou: language === 'sv' ? 'Tack! Ditt dokument är uppladdat.' : 'Thank you! Your document has been uploaded.',
    invalidType: language === 'sv' ? 'Ogiltig filtyp. Tillåtna: PDF, PNG, JPG.' : 'Invalid file type. Allowed: PDF, PNG, JPG.',
    tooLarge: language === 'sv' ? 'Filen är för stor. Max 5 MB.' : 'File is too large. Max 5 MB.',
    missing: language === 'sv' ? 'Vänligen ladda upp din fil först' : 'Please upload your file first'
  }), [language]);


  if (!pending) return null;

  let fileRef: HTMLInputElement | null = null;

  const handleChooseClick = () => fileRef?.click();
  const handleFileChange = () => {
    const f = fileRef?.files?.[0] || null;
    setSelectedFileName(f ? f.name : null);
  };

  const onUpload = async () => {
    if (!userProfile?.id) return;
    const file = fileRef?.files?.[0];
    if (!file) {
      toast({ title: language === 'sv' ? 'Fil saknas' : 'File missing', description: tText.missing, variant: 'destructive' });
      return;
    }
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!validTypes.includes(file.type)) {
      toast({ title: 'Fel', description: tText.invalidType, variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Fel', description: tText.tooLarge, variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      const path = `${userProfile.id}/${pending.id}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('id_documents')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('id_verifications')
        .update({ document_path: path, uploaded_at: new Date().toISOString(), status: 'uploaded' })
        .eq('id', pending.id);
      if (updateError) throw updateError;

      toast({ title: language === 'sv' ? 'Klart!' : 'Done!', description: language === 'sv' ? 'Ditt dokument är mottaget.' : 'Your document has been received.' });
      setPending(null);
    } catch (e) {
      console.error('Upload failed', e);
      toast({ title: 'Fel', description: 'Kunde inte ladda upp', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 rounded-2xl border bg-[hsl(var(--id-info-bg))] dark:bg-[hsl(var(--id-info-bg))] border-[hsl(var(--id-info-border))] dark:border-[hsl(var(--id-info-border))]">
      <h2 className="mb-2 flex items-center gap-2 !text-[hsl(var(--id-info-text))]">
        <Info className="h-5 w-5 [&>circle]:fill-[hsl(var(--id-info-icon-fill))] [&>circle]:stroke-[hsl(var(--id-info-icon-fill))] [&>path]:stroke-[hsl(var(--id-info-icon-i))]" /> {tText.title}
      </h2>
      <p className="text-sm mb-4 text-[hsl(var(--id-info-text))]">{tText.description}</p>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Input
          type="file"
          accept="application/pdf,image/png,image/jpeg"
          onChange={handleFileChange}
          ref={(el) => (fileRef = el)}
          className="sr-only"
        />
        <div className="flex flex-col sm:flex-row flex-1 items-start sm:items-center gap-1 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleChooseClick}
            className="rounded-[12px] !h-[2.5rem] w-full sm:w-auto justify-center bg-[hsl(var(--id-info-input-bg))] border-[hsl(var(--id-info-input-border))] text-[hsl(var(--id-info-file-text))] hover:bg-[hsl(var(--id-info-input-bg))] hover:text-[hsl(var(--id-info-file-text))] hover:border-[hsl(var(--id-info-input-border))] dark:bg-[hsl(var(--id-info-input-bg))] dark:border-[hsl(var(--id-info-input-border))] dark:text-[hsl(var(--id-info-file-text))] dark:hover:bg-[hsl(var(--id-info-input-bg))] dark:hover:text-[hsl(var(--id-info-file-text))] dark:hover:border-[hsl(var(--id-info-input-border))]"
          >
            <Upload className="h-4 w-4 mr-2" /> {tText.choose}
          </Button>
          <span className={selectedFileName ? "text-[hsl(var(--id-info-file-text))] text-sm" : "hidden sm:inline text-[hsl(var(--id-info-file-text))] text-sm"}>
            {selectedFileName ?? tText.noFile}
          </span>
        </div>
        <p className="mb-2 text-xs text-[hsl(var(--id-info-text))] sm:hidden">{tText.selectFile}</p>
        <Button variant="idinfo" className="rounded-[12px] !h-[2.5rem]" onClick={onUpload} disabled={isUploading}>
          {tText.upload}
        </Button>
      </div>
      <p className="mt-2 text-xs text-[hsl(var(--id-info-text))] hidden sm:block">{tText.selectFile}</p>
    </div>
  );
}
