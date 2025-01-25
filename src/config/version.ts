// This file manages the application version by reading from Supabase
// Format: MAJOR.MINOR.PATCH follows semantic versioning

import { supabase } from "@/integrations/supabase/client";

export const APP_VERSION = "0.0.1"; // Default version

export const getAppVersion = async () => {
  try {
    console.log('Fetching app version from Supabase...');
    const { data, error } = await supabase
      .from('app_changes')
      .select('major, minor, patch')
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching app version:', error);
      return APP_VERSION;
    }

    if (data) {
      console.log('App version data:', data);
      return `${data.major}.${data.minor}.${data.patch}`;
    }

    return APP_VERSION;
  } catch (err) {
    console.error('Failed to fetch app version:', err);
    return APP_VERSION;
  }
};