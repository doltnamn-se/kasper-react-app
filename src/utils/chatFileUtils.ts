import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/types/chat';

/**
 * Pre-generates signed URLs for all chat message attachments
 * This improves performance by avoiding individual URL generation per component
 */
export async function preGenerateSignedUrls(messages: ChatMessage[]): Promise<ChatMessage[]> {
  const messagesWithSignedUrls = await Promise.all(
    messages.map(async (message) => {
      // Skip if no attachment or if it's already a full URL (old format)
      if (!message.attachment_url || message.attachment_url.startsWith('http')) {
        return message;
      }

      try {
        // Generate signed URL for storage path
        const { data, error } = await supabase.storage
          .from('chat-attachments')
          .createSignedUrl(message.attachment_url, 3600); // 1 hour expiry

        if (error) {
          console.error('Error generating signed URL for message:', message.id, error);
          return message;
        }

        // Return message with pre-generated signed URL
        return {
          ...message,
          attachment_url: data.signedUrl
        };
      } catch (error) {
        console.error('Failed to generate signed URL for message:', message.id, error);
        return message;
      }
    })
  );

  return messagesWithSignedUrls;
}

/**
 * Check if a URL is a storage path (needs signed URL) vs full URL
 */
export function isStoragePath(url: string): boolean {
  return url && !url.startsWith('http');
}
