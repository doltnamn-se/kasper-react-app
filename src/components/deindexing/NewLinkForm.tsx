import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

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
    <div className="absolute z-10 w-[300px] right-0 bg-white dark:bg-[#1c1c1e] rounded-md shadow-lg border border-gray-200 dark:border-[#232325] p-4 mt-2">
      <form onSubmit={handleSubmit} className="flex gap-2">
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
          className="bg-black text-white hover:bg-[#333333] dark:bg-white dark:text-black dark:hover:bg-[#c7c7c7]"
        >
          {language === 'sv' ? 'Lägg till' : 'Add'}
        </Button>
      </form>
    </div>
  );
};