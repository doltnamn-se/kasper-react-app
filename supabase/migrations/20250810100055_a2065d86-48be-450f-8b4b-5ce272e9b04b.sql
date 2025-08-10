-- Update the ID verification request function to use Swedish title and message
CREATE OR REPLACE FUNCTION public.request_id_verification(p_customer_id uuid, p_requested_by uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_id uuid;
BEGIN
  -- Insert request row
  INSERT INTO public.id_verifications (customer_id, requested_by, status)
  VALUES (p_customer_id, p_requested_by, 'requested')
  RETURNING id INTO new_id;

  -- Notify the customer with updated Swedish copy
  INSERT INTO public.notifications (user_id, title, message, type, read)
  VALUES (
    p_customer_id,
    'ID verifiering krävs',
    'För borttagning av länkar på Bing krävs det att man styrker sin identitet med kopia på ID-handling.',
    'id_verification_request',
    false
  );

  RETURN new_id;
END;
$function$;