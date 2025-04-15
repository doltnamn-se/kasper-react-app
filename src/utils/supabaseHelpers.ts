
import { PostgrestError } from '@supabase/supabase-js';

export function isError<T>(
  result: T | PostgrestError
): result is PostgrestError {
  return (result as PostgrestError).code !== undefined;
}

export function handleQueryResult<T>(
  data: T | null,
  error: PostgrestError | null
): T | null {
  if (error) {
    console.error('Database query error:', error);
    return null;
  }
  return data;
}

export function ensureResult<T>(
  result: T | null,
  errorMessage: string = 'Failed to fetch data'
): T {
  if (!result) {
    throw new Error(errorMessage);
  }
  return result;
}

// Add this type to define the device token structure
export type DeviceToken = {
  id: string;
  user_id: string;
  token: string;
  device_type: string;
  created_at: string;
  last_updated: string;
};
