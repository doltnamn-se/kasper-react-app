-- Ensure only one AFTER INSERT trigger sends emails for notifications
-- 1) Drop any existing AFTER INSERT triggers that call handle_notification_email
DROP TRIGGER IF EXISTS handle_notification_email_trigger ON public.notifications;
DROP TRIGGER IF EXISTS trigger_notification_email ON public.notifications;
DROP TRIGGER IF EXISTS on_notification_created ON public.notifications;

-- 2) Recreate a single, canonical trigger
CREATE TRIGGER trigger_notification_email
AFTER INSERT ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.handle_notification_email();