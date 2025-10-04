-- ALTER TABLE --

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'workspaces' 
      AND column_name = 'image_path'
  ) THEN
    ALTER TABLE workspaces
    ADD COLUMN image_path TEXT DEFAULT '' NOT NULL CHECK (char_length(image_path) <= 1000);
  END IF;
END $$;

-- STORAGE --

INSERT INTO storage.buckets (id, name, public) VALUES ('workspace_images', 'workspace_images', false)
ON CONFLICT (id) DO NOTHING;

-- FUNCTIONS --

CREATE OR REPLACE FUNCTION delete_old_workspace_image()
RETURNS TRIGGER
LANGUAGE 'plpgsql'
SECURITY DEFINER
AS $$
DECLARE
  status INT;
  content TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT
      INTO status, content
      result.status, result.content
      FROM public.delete_storage_object_from_bucket('workspace_images', OLD.image_path) AS result;
    IF status <> 200 THEN
      RAISE WARNING 'Could not delete workspace image: % %', status, content;
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- TRIGGERS --

DROP TRIGGER IF EXISTS delete_old_workspace_image ON workspaces;
CREATE TRIGGER delete_old_workspace_image
AFTER DELETE ON workspaces
FOR EACH ROW
EXECUTE PROCEDURE delete_old_workspace_image();

-- POLICIES --

CREATE OR REPLACE FUNCTION public.non_private_workspace_exists(p_name text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM workspaces
        WHERE (id::text = (storage.filename(p_name))) AND sharing <> 'private'
    );
$$;

DROP POLICY IF EXISTS "Allow public read access on non-private workspace images" ON storage.objects;
CREATE POLICY "Allow public read access on non-private workspace images"
    ON storage.objects FOR SELECT TO public
    USING (bucket_id = 'workspace_images' AND public.non_private_workspace_exists(name));

DROP POLICY IF EXISTS "Allow insert access to own workspace images" ON storage.objects;
CREATE POLICY "Allow insert access to own workspace images"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'workspace_images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Allow update access to own workspace images" ON storage.objects;
CREATE POLICY "Allow update access to own workspace images"
    ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'workspace_images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Allow delete access to own workspace images" ON storage.objects;
CREATE POLICY "Allow delete access to own workspace images"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'workspace_images' AND (storage.foldername(name))[1] = auth.uid()::text);
