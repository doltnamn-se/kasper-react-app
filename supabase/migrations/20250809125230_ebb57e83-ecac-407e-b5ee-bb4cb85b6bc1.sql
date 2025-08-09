-- 1) Create id_verifications table
CREATE TABLE IF NOT EXISTS public.id_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  requested_by UUID,
  status TEXT NOT NULL DEFAULT 'requested',
  document_path TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  uploaded_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.id_verifications ENABLE ROW LEVEL SECURITY;

-- Policies: super admin full, customers read/update own, admins insert
CREATE POLICY "Super admin full access to id_verifications"
ON public.id_verifications
FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

CREATE POLICY "Customers can select their own id_verifications"
ON public.id_verifications
FOR SELECT
USING (customer_id = auth.uid());

CREATE POLICY "Customers can update their own id_verifications"
ON public.id_verifications
FOR UPDATE
USING (customer_id = auth.uid())
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Admins can insert id_verifications"
ON public.id_verifications
FOR INSERT
WITH CHECK (is_super_admin());

-- Update timestamp trigger function (reuse if exists else create here)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_id_verifications_updated_at
BEFORE UPDATE ON public.id_verifications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Storage bucket for ID documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('id_documents', 'id_documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "ID docs - customers can upload their own"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'id_documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "ID docs - customers can view their own"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'id_documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "ID docs - super admin full access"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'id_documents' AND is_super_admin())
WITH CHECK (bucket_id = 'id_documents' AND is_super_admin());

-- 3) Helper function to request verification (admin -> customer notification)
CREATE OR REPLACE FUNCTION public.request_id_verification(p_customer_id uuid, p_requested_by uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  -- Insert request row
  INSERT INTO public.id_verifications (customer_id, requested_by, status)
  VALUES (p_customer_id, p_requested_by, 'requested')
  RETURNING id INTO new_id;

  -- Notify the customer
  INSERT INTO public.notifications (user_id, title, message, type, read)
  VALUES (
    p_customer_id,
    'ID verification needed',
    'Please upload a photo/scan of your ID or passport for verification.',
    'id_verification_request',
    false
  );

  RETURN new_id;
END;
$$;

-- 4) Trigger to notify admin when a document is uploaded
CREATE OR REPLACE FUNCTION public.handle_id_document_uploaded()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_id uuid;
BEGIN
  -- Only act when a document has been set or status changed to uploaded
  IF (NEW.document_path IS NOT NULL AND (OLD.document_path IS DISTINCT FROM NEW.document_path))
     OR (NEW.status = 'uploaded' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    -- Fetch super admin id (using the known email)
    SELECT id INTO admin_id FROM auth.users WHERE email = 'info@doltnamn.se' LIMIT 1;

    IF admin_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, message, type, read)
      VALUES (
        admin_id,
        'Customer uploaded ID document',
        'A customer has uploaded an ID/passport. You can download it from their profile.',
        'id_verification_uploaded',
        false
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_id_document_uploaded ON public.id_verifications;
CREATE TRIGGER trg_id_document_uploaded
AFTER UPDATE ON public.id_verifications
FOR EACH ROW EXECUTE FUNCTION public.handle_id_document_uploaded();
