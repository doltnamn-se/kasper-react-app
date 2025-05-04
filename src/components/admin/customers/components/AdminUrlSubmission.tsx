
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, CornerDownLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Separator } from "@/components/ui/separator";

interface AdminUrlSubmissionProps {
  customerId: string;
}
export const AdminUrlSubmission = ({
  customerId
}: AdminUrlSubmissionProps) => {
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const {
    t,
    language
  } = useLanguage();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setIsSubmitting(true);
    try {
      // Initialize status history
      const timestamp = new Date().toISOString();
      const initialStatus = {
        status: 'received',
        timestamp: timestamp
      };
      const {
        error
      } = await supabase.from('removal_urls').insert({
        customer_id: customerId,
        url: url.trim(),
        status: 'received',
        display_in_incoming: true,
        status_history: [initialStatus]
      });
      if (error) throw error;

      // Invalidate relevant queries
      await queryClient.invalidateQueries({
        queryKey: ['customer-data', customerId]
      });
      toast({
        title: "Success",
        description: "URL added successfully"
      });
      setUrl("");
    } catch (error) {
      console.error('Error adding URL:', error);
      toast({
        title: "Error",
        description: "Could not add URL. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set placeholder text based on the current language
  const placeholderText = language === 'sv' ? 'Ange länk' : 'Enter link';
  // Set button text based on current language
  const buttonText = language === 'sv' ? 'Lägg till' : 'Add';
  return <form onSubmit={handleSubmit} className="mt-4 space-y-2">
      <div className="flex gap-2">
        <Input 
          type="url" 
          value={url} 
          onChange={e => setUrl(e.target.value)} 
          placeholder={placeholderText} 
          className="flex-1 bg-[#f5f5f5] dark:bg-[#121212]" 
          required 
        />
        <Button type="submit" disabled={isSubmitting} className="bg-[#e0e0e0] text-[#000000] hover:bg-[#d0d0d0] dark:bg-[#2a2a2b] dark:text-white dark:hover:bg-[#3a3a3b]">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>
              {buttonText}
              <CornerDownLeft className="h-4 w-4 ml-2" />
            </>}
        </Button>
      </div>
      
      {/* Updated separator with consistent padding */}
      <div className="pt-5 pb-5">
        <Separator className="my-0" />
      </div>
    </form>;
};
