import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { FirecrawlService } from '@/utils/FirecrawlService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Eye, Globe, Zap } from "lucide-react";

interface ScrapeResult {
  success: boolean;
  data?: {
    markdown: string;
    html: string;
    metadata: {
      title: string;
      description: string;
      keywords: string;
      robots: string;
      ogTitle: string;
      ogDescription: string;
      ogImage: string;
      ogUrl: string;
      statusCode: number;
    };
  };
}

export const WebsiteReferenceChecker = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null);

  const handleScrapeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setProgress(0);
    setScrapeResult(null);
    
    try {
      console.log('Starting scrape for URL:', url);
      setProgress(50);
      const result = await FirecrawlService.scrapeWebsite(url);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Website scraped successfully! Now I can analyze it for you.",
          duration: 3000,
        });
        setScrapeResult(result);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to scrape website",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error scraping website:', error);
      toast({
        title: "Error",
        description: "Failed to scrape website",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Website Reference Checker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleScrapeSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="url" className="text-sm font-medium">
                Website URL to analyze
              </label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
              />
            </div>
            {isLoading && (
              <Progress value={progress} className="w-full" />
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Analyzing..." : "Analyze Website"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {scrapeResult && scrapeResult.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Website Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    <Zap className="h-3 w-3 mr-1" />
                    Page Info
                  </Badge>
                  <div className="space-y-1 text-sm">
                    <p><strong>Title:</strong> {scrapeResult.data.metadata?.title || 'N/A'}</p>
                    <p><strong>Status:</strong> {scrapeResult.data.metadata?.statusCode || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <Badge variant="secondary" className="mb-2">SEO</Badge>
                  <div className="space-y-1 text-sm">
                    <p><strong>Description:</strong> {scrapeResult.data.metadata?.description?.substring(0, 100) || 'N/A'}...</p>
                    <p><strong>Keywords:</strong> {scrapeResult.data.metadata?.keywords || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="markdown" className="w-full">
                <TabsList>
                  <TabsTrigger value="markdown">Markdown Content</TabsTrigger>
                  <TabsTrigger value="html">HTML Structure</TabsTrigger>
                </TabsList>
                <TabsContent value="markdown">
                  <Card>
                    <CardContent className="pt-6">
                      <pre className="bg-muted p-4 rounded overflow-auto max-h-96 text-xs whitespace-pre-wrap">
                        {scrapeResult.data.markdown || 'No markdown content available'}
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="html">
                  <Card>
                    <CardContent className="pt-6">
                      <pre className="bg-muted p-4 rounded overflow-auto max-h-96 text-xs">
                        {scrapeResult.data.html?.substring(0, 3000) || 'No HTML content available'}
                        {scrapeResult.data.html && scrapeResult.data.html.length > 3000 && '...'}
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✅ <strong>Website analyzed successfully!</strong> Now you can describe what you want to implement and reference this website. 
                  I can see the structure, content, and styling approaches used on this site.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};