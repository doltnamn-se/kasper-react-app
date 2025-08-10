
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { updateMonitoringUrl } from "./operations/updateMonitoringUrl.ts";
import { createRemovalUrl } from "./operations/createRemovalUrl.ts";
import { createUserNotification } from "./operations/createUserNotification.ts";
import { createAdminNotification } from "./operations/createAdminNotification.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      monitoringUrlId, 
      siteName, 
      newStatus, 
      reason, 
      customerId, 
      language,
      forceEmail,
      skipUserEmail
    } = await req.json();

    console.log(`Processing URL status update: ${monitoringUrlId} to ${newStatus} for customer ${customerId}`);
    console.log(`Request details:`, { 
      monitoringUrlId, 
      siteName, 
      newStatus, 
      reason, 
      customerId, 
      language, 
      forceEmail,
      skipUserEmail
    });
    
    if (!monitoringUrlId || !newStatus || !customerId) {
      console.error("Missing required data:", { monitoringUrlId, newStatus, customerId });
      return new Response(
        JSON.stringify({ success: false, error: "Missing required data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Update monitoring URL status
    const updatedUrl = await updateMonitoringUrl(monitoringUrlId, newStatus, reason);

    // 2. Create a removal URL entry if status is 'approved' and it doesn't already exist
    let removalUrl = null;
    if (newStatus === 'approved') {
      removalUrl = await createRemovalUrl(customerId, siteName);
    }

    // 3. Create user notification and potentially send email (only for approved)
    let userNotification = null;
    if (newStatus === 'approved') {
      userNotification = await createUserNotification(
        customerId, 
        newStatus, 
        language, 
        skipUserEmail, 
        forceEmail
      );
    } else if (newStatus === 'rejected') {
      console.log('Skipping user notification/email for rejected status as per policy');
      try {
        await deleteRecentMonitoringNotification(customerId);
      } catch (cleanupError) {
        console.error('Error cleaning up recent monitoring notification:', cleanupError);
      }
    }

    // 4. Create admin notification about the status change
    const notification = await createAdminNotification(
      siteName, 
      newStatus, 
      customerId, 
      language
    );

    // 5. Create additional notification for monitoring approval
    let monitoringApprovalNotification = null;
    if (newStatus === 'approved') {
      monitoringApprovalNotification = await createAdminMonitoringApprovalNotification(
        language
      );
    }

    // Return success with all created/updated data
    return new Response(
      JSON.stringify({
        success: true,
        updatedUrl,
        notification,
        monitoringApprovalNotification,
        removalUrl,
        removalUrlCreated: newStatus === 'approved' && !!removalUrl
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message, stack: error.stack }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper function for monitoring approval notifications
async function createAdminMonitoringApprovalNotification(language: string) {
  // Get Supabase client with admin privileges
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.47.0");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  // Super admin ID - hardcoded for security
  const SUPER_ADMIN_ID = "a0e63991-d45b-43d4-a8fe-3ecda8c64e9d";
  
  const approvalTitle = language === 'sv' ? 'URL godkänd av användare' : 'URL approved by user';
  const approvalMessage = language === 'sv' 
    ? 'En bevaknings-URL godkändes av en användare och flyttades till länkhantering'
    : 'A monitoring URL was approved by a user and moved to link management';
  
  try {
    const { data: adminNotification, error: approvalNotificationError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: SUPER_ADMIN_ID,
        title: approvalTitle,
        message: approvalMessage,
        type: 'monitoring_approval',
        read: false
      })
      .select()
      .single();
    
    if (approvalNotificationError) {
      console.error("Error creating monitoring approval notification:", approvalNotificationError);
      return null;
    }
    
    console.log("Created monitoring approval notification:", adminNotification);
    return adminNotification;
  } catch (error) {
    console.error("Error creating approval notification:", error);
    return null;
  }
}

// Helper function to remove any recent "monitoring" notifications accidentally created on rejection
async function deleteRecentMonitoringNotification(userId: string) {
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.47.0");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    // Find recent monitoring notifications for this user
    const { data: recentNotifications, error: fetchError } = await supabaseAdmin
      .from('notifications')
      .select('id, created_at, type')
      .eq('user_id', userId)
      .eq('type', 'monitoring')
      .gte('created_at', twoMinutesAgo)
      .order('created_at', { ascending: false })
      .limit(5);

    if (fetchError) {
      console.error('Error fetching recent monitoring notifications:', fetchError);
      return;
    }

    if (!recentNotifications || recentNotifications.length === 0) {
      console.log('No recent monitoring notifications to delete for user', userId);
      return;
    }

    const idsToDelete = recentNotifications.map(n => n.id);
    const { error: deleteError } = await supabaseAdmin
      .from('notifications')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) {
      console.error('Error deleting recent monitoring notifications:', deleteError);
      return;
    }

    console.log('Deleted recent monitoring notifications for user', userId, idsToDelete);
  } catch (error) {
    console.error('Unexpected error during notification cleanup:', error);
  }
}
