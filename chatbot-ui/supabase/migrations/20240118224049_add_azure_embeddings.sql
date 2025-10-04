DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'azure_openai_embeddings_id'
  ) THEN
    ALTER TABLE profiles
    ADD COLUMN azure_openai_embeddings_id TEXT CHECK (char_length(azure_openai_embeddings_id) <= 1000);
  END IF;
END $$;
