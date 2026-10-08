REVOKE SELECT ON TABLE public.resources FROM anon;
DROP POLICY IF EXISTS "Public reads published" ON public.resources;
CREATE POLICY "Members read published and admins read all"
ON public.resources
FOR SELECT
TO authenticated
USING (published OR public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Public read resource files" ON storage.objects;
CREATE POLICY "Members read resource files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'resources');