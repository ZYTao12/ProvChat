--------------- EXPERIMENT STATE ---------------

-- TABLE --

CREATE TABLE IF NOT EXISTS public.experiment_state (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    pre_survey_completed boolean NOT NULL DEFAULT false,
    convo1_completed boolean NOT NULL DEFAULT false,
    convo2_completed boolean NOT NULL DEFAULT false,
    post_survey_completed boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz
);

-- RLS --

ALTER TABLE public.experiment_state ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'experiment_state' AND policyname = 'Allow full access to own experiment state'
  ) THEN
    CREATE POLICY "Allow full access to own experiment state"
      ON public.experiment_state
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- TRIGGER --

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_experiment_state_updated_at'
  ) THEN
    CREATE TRIGGER update_experiment_state_updated_at
    BEFORE UPDATE ON public.experiment_state
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
  END IF;
END $$; 