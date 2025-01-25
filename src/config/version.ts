import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { create } from 'zustand';

interface VersionState {
  version: string;
  setVersion: (version: string) => void;
}

export const useVersionStore = create<VersionState>((set) => ({
  version: '1.1.0', // Default version
  setVersion: (version) => set({ version }),
}));

let versionChannel: RealtimeChannel;

export const initializeVersionTracking = async () => {
  console.log('Initializing version tracking...');
  
  // Initial fetch
  const { data, error } = await supabase
    .from('app_changes')
    .select('major, minor, patch')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching initial version:', error);
    return;
  }

  if (data) {
    const version = `${data.major}.${data.minor}.${data.patch}`;
    console.log('Initial version:', version);
    useVersionStore.getState().setVersion(version);
  }

  // Set up real-time subscription
  versionChannel = supabase
    .channel('app_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'app_changes'
      },
      (payload) => {
        console.log('Version change detected:', payload);
        const { major, minor, patch } = payload.new;
        const newVersion = `${major}.${minor}.${patch}`;
        console.log('Updating to version:', newVersion);
        useVersionStore.getState().setVersion(newVersion);
      }
    )
    .subscribe((status) => {
      console.log('Version subscription status:', status);
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