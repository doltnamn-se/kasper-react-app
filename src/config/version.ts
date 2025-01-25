import { supabase } from "@/integrations/supabase/client";

export const APP_VERSION = "1.0.109"; // Default version

export const getAppVersion = async () => {
  try {
    console.log('Fetching app version from Supabase...');
    const { data, error } = await supabase
      .from('app_changes')
      .select('major, minor, patch')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching app version:', error);
      return APP_VERSION;
    }

    if (!data) {
      console.log('No version data found in database, using default:', APP_VERSION);
      return APP_VERSION;
    }

    console.log('Raw version data from database:', data);
    const version = `${data.major}.${data.minor}.${data.patch}`;
    console.log('Constructed version string:', version);
    return version;
  } catch (err) {
    console.error('Failed to fetch app version:', err);
    return APP_VERSION;
  }
};