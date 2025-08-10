-- Fix duplicate email sends: ensure only one notification trigger exists
-- 1) Drop any existing triggers on notifications
DROP TRIGGER IF EXISTS on_notification_created ON public.notifications;
DROP TRIGGER IF EXISTS trigger_notification_email ON public.notifications;

-- 2) Recreate a single, consistent trigger pointing to the current function
CREATE TRIGGER trigger_notification_email
AFTER INSERT ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.handle_notification_email();