import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://upfapfohwnkiugvebujh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZmFwZm9od25raXVndmVidWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4OTk1MjEsImV4cCI6MjA1MjQ3NTUyMX0.bph8bum09_ZYifznCYeksXeTsPQnn3m1TdWhbwfcvA0";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: localStorage,
      storageKey: 'supabase.auth.token',
      flowType: 'pkce'
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-client',
      },
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    db: {
      schema: 'public'
    }
  }
);

// Initialize Supabase client and verify connection
(async () => {
  try {
    console.log('Initializing Supabase client...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error initializing Supabase client:', sessionError);
      return;
    }

    console.log('Supabase client initialized successfully with URL:', SUPABASE_URL);
    
    if (session) {
      console.log('Active session found');
      try {
        // Test the profiles table access
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .limit(1)
          .maybeSingle();
        
        if (profileError) {
          console.error('Error testing profiles access:', profileError);
        } else {
          console.log('Successfully tested profiles access');
        }
      } catch (err) {
        console.error('Error testing database access:', err);
      }
    } else {
      console.log('No active session');
    }
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
})();