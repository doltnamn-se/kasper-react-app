import { supabase } from '@/integrations/supabase/client';

interface ScrapeResponse {
  success: boolean;
  error?: string;
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

export class FirecrawlService {
  static async scrapeWebsite(url: string): Promise<ScrapeResponse> {
    try {
      console.log('Making scrape request via Supabase Edge Function');
      
      const { data, error } = await supabase.functions.invoke('firecrawl-scrape', {
        body: { url }
      });

      if (error) {
        console.error('Edge function error:', error);
        return { 
          success: false, 
          error: error.message || 'Failed to scrape website' 
        };
      }

      if (!data.success) {
        console.error('Scrape failed:', data.error);
        return { 
          success: false, 
          error: data.error || 'Failed to scrape website' 
        };
      }

      console.log('Scrape successful');
      return { 
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Error during scrape:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to scraping service' 
      };
    }
  }
}