
import { supabase } from "@/integrations/supabase/client";
import { MonitoringUrl, MonitoringUrlStatus } from "@/types/monitoring-urls";
import { fetchAllUrls } from "./queries/fetchAllUrls";
import { fetchCustomerUrls } from "./queries/fetchCustomerUrls";
import { addUrl } from "./queries/addUrl";
import { updateUrlStatus } from "./queries/updateUrlStatus";

// Temporary variable to reference the queryClient
// This will be set by useMonitoringUrls hook
let queryClient: any = null;

// Fetch all monitoring URLs (admin view)
export const fetchAllMonitoringUrls = fetchAllUrls;

// Fetch monitoring URLs for a specific customer
export const fetchCustomerMonitoringUrls = fetchCustomerUrls;

// Add a new monitoring URL
export const addMonitoringUrl = addUrl;

// Update monitoring URL status
export const updateMonitoringUrlStatus = updateUrlStatus;

// Function to set the queryClient reference for use in updateMonitoringUrlStatus
export function setQueryClientReference(client: any) {
  queryClient = client;
}

// Export queryClient for use in the update functions
export function getQueryClient() {
  return queryClient;
}
