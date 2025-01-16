import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";

export const RemovalUrls = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [urls, setUrls] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Filter out empty URLs
      const validUrls = urls.filter(url => url.trim() !== '');

      if (validUrls.length > 0) {
        const { error: urlsError } = await supabase
          .from("removal_urls")
          .insert(
            validUrls.map(url => ({
              customer_id: user.id,
              url: url.trim(),
            }))
          );

        if (urlsError) throw urlsError;
      }

      // Update onboarding step
      const { error: updateError } = await supabase
        .from("customers")
        .update({ onboarding_step: 4 })
        .eq("id", user.id);

      if (updateError) throw updateError;

      navigate("/onboarding/identification");

      toast({
        title: "Success",
        description: "URLs saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addUrl = () => {
    setUrls([...urls, '']);
  };

  const removeUrl = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Add URLs for Removal</h1>
        <p className="text-muted-foreground">
          Enter the URLs you want us to remove
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {urls.map((url, index) => (
            <div key={index} className="flex gap-2">
              <Input
                type="url"
                placeholder="Enter URL"
                value={url}
                onChange={(e) => updateUrl(index, e.target.value)}
              />
              {urls.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeUrl(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={addUrl}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Another URL
        </Button>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : "Continue"}
        </Button>
      </form>
    </div>
  );
};