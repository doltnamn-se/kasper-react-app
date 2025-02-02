import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { CornerDownLeft } from "lucide-react";

interface NewLinkFormProps {
  onClose: () => void;
}

export const NewLinkForm = ({ onClose }: NewLinkFormProps) => {
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) return;
    
    setIsSubmitting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user session');

      const { error } = await supabase
        .from('removal_urls')
        .insert({
          customer_id: session.user.id,
          url: url,
          status: 'received',
          display_in_incoming: true
        });

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['used-urls'] });
      await queryClient.invalidateQueries({ queryKey: ['incoming-urls'] });
      
      toast({
        title: t('success'),
        description: language === 'sv' ? 'Länk tillagd' : 'Link added',
      });
      
      onClose();
    } catch (error) {
      console.error('Error adding URL:', error);
      toast({
        title: t('error'),
        description: language === 'sv' ? 'Kunde inte lägga till länk' : 'Could not add link',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />
      <div className="absolute z-40 w-[400px] right-[164px] bg-white dark:bg-[#1c1c1e] rounded-md shadow-lg border border-gray-200 dark:border-[#232325] p-2 mt-2">
        <form onSubmit={handleSubmit} className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={language === 'sv' ? 'Ange URL' : 'Enter URL'}
            className="flex-1"
            required
          />
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-[#e0e0e0] hover:bg-[#d0d0d0] text-black dark:bg-[#2a2a2b] dark:hover:bg-[#3a3a3b] dark:text-black"
          >
            {language === 'sv' ? 'Spara' : 'Save'}
            <CornerDownLeft className="h-4 w-4 ml-2 text-black" />
          </Button>
        </form>
      </div>
    </>
  );
};