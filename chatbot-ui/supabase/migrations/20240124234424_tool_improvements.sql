DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'tools' 
      AND column_name = 'custom_headers'
  ) THEN
    ALTER TABLE tools
    ADD COLUMN custom_headers JSONB NOT NULL DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'tools' 
      AND column_name = 'request_in_body'
  ) THEN
    ALTER TABLE tools
    ADD COLUMN request_in_body BOOLEAN NOT NULL DEFAULT TRUE;
  END IF;

  -- Set default on schema column if not already set
  -- Note: Postgres doesn't expose default presence in information_schema reliably; try-catch style
  BEGIN
    ALTER TABLE tools ALTER COLUMN schema SET DEFAULT '{}';
  EXCEPTION WHEN others THEN
    -- ignore if already set or column missing
    NULL;
  END;
END $$;
