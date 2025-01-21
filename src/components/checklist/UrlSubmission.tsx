import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash } from "lucide-react";

interface UrlSubmissionProps {
  onComplete: () => void;
}

export const UrlSubmission = ({ onComplete }: UrlSubmissionProps) => {
  const [urls, setUrls] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const addUrlField = () => {
    setUrls([...urls, '']);
  };

  const removeUrlField = (index: number) => {
    const newUrls = urls.filter((_, i) => i !== index);
    setUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user session');

      const validUrls = urls.filter(url => url.trim() !== '');
      
      const { error } = await supabase
        .from('customer_checklist_progress')
        .update({ removal_urls: validUrls })
        .eq('customer_id', session.user.id);

      if (error) throw error;

      toast({
        title: "URLs saved",
        description: "Your URLs have been successfully saved.",
      });
      
      onComplete();
    } catch (error) {
      console.error('Error saving URLs:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save URLs. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {urls.map((url, index) => (
        <div key={index} className="flex gap-2">
          <Input
            type="url"
            placeholder="Enter URL"
            value={url}
            onChange={(e) => handleUrlChange(index, e.target.value)}
            required
          />
          {urls.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeUrlField(index)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      
      <Button
        type="button"
        variant="outline"
        onClick={addUrlField}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Another URL
      </Button>
      
      <Button
        type="submit"
        disabled={isLoading || urls.every(url => url.trim() === '')}
        className="w-full"
      >
        {isLoading ? "Saving..." : "Save URLs"}
      </Button>
    </form>
  );
};