import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { create } from 'zustand';
import { getLatestVersion } from '@/utils/versionUtils';

interface VersionState {
  version: string;
  setVersion: (version: string) => void;
}

export const useVersionStore = create<VersionState>((set) => ({
  version: '1.0.0', // Default version until loaded from DB
  setVersion: (version) => set({ version }),
}));

let versionChannel: RealtimeChannel;

export const initializeVersionTracking = async () => {
  console.log('Initializing version tracking...');
  
  // Fetch latest version from version_logs table
  const latestVersion = await getLatestVersion();
  
  if (latestVersion) {
    const versionString = latestVersion.version_string;
    console.log('Initial version from version_logs:', versionString);
    useVersionStore.getState().setVersion(versionString);
  } else {
    console.log('No version found in version_logs, falling back to default version');
    // We keep the default value set in the store
  }

  // Set up real-time subscription to version_logs table for future updates
  versionChannel = supabase.channel('version-logs-tracking')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'version_logs'
      },
      (payload: RealtimePostgresChangesPayload<{
        version_string: string;
      }>) => {
        console.log('Version log insertion detected:', payload);
        if (payload.new && 'version_string' in payload.new) {
          const newVersion = payload.new.version_string;
          console.log('Updating to version:', newVersion);
          useVersionStore.getState().setVersion(newVersion);
        }
      }
    )
    .subscribe((status) => {
      console.log('Version logs subscription status:', status);
    });
};

export const cleanupVersionTracking = () => {
  if (versionChannel) {
    console.log('Cleaning up version tracking...');
    versionChannel.unsubscribe();
  }
};

// For backwards compatibility
export const getAppVersion = async () => {
  return useVersionStore.getState().version;
};
