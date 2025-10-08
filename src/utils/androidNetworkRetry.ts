import { isAndroid } from '@/capacitor';

interface RetryConfig {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}

const defaultConfig: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

/**
 * Retry a function with exponential backoff, specifically for Android
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  // Only apply retry logic on Android
  if (!isAndroid()) {
    return fn();
  }

  const { maxRetries, initialDelay, maxDelay, backoffMultiplier } = {
    ...defaultConfig,
    ...config,
  };

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Android Retry] Attempt ${attempt + 1}/${maxRetries + 1}`);
      const result = await fn();
      
      if (attempt > 0) {
        console.log(`[Android Retry] Success after ${attempt} retries`);
      }
      
      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(`[Android Retry] Attempt ${attempt + 1} failed:`, error);

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        console.error(`[Android Retry] All ${maxRetries + 1} attempts failed`);
        throw lastError;
      }

      // Wait before retrying with exponential backoff
      console.log(`[Android Retry] Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Increase delay for next attempt, capped at maxDelay
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError!;
}

/**
 * Wrapper for Supabase queries with retry logic on Android
 */
export async function queryWithRetry<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> {
  return retryWithBackoff(async () => {
    const result = await queryFn();
    
    // If there's an error, throw it to trigger retry
    if (result.error) {
      throw new Error(result.error.message || 'Query failed');
    }
    
    return result;
  });
}
