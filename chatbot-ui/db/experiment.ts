import { createClient } from "@/lib/supabase/client"

export type ExperimentState = {
  user_id: string
  pre_survey_completed: boolean
  convo1_completed: boolean
  convo2_completed: boolean
  post_survey_completed: boolean
}

export async function getOrCreateExperimentState(userId: string): Promise<ExperimentState> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("experiment_state")
    .select("user_id, pre_survey_completed, convo1_completed, convo2_completed, post_survey_completed")
    .eq("user_id", userId)
    .maybeSingle()

  if (error) throw new Error(error.message)

  if (data) return data as ExperimentState

  const { data: created, error: insertError } = await supabase
    .from("experiment_state")
    .insert([{ user_id: userId }])
    .select("user_id, pre_survey_completed, convo1_completed, convo2_completed, post_survey_completed")
    .single()

  if (insertError) throw new Error(insertError.message)
  return created as ExperimentState
}

export async function setExperimentFlag(userId: string, partial: Partial<Omit<ExperimentState, "user_id">>): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("experiment_state")
    .upsert({ user_id: userId, ...partial }, { onConflict: "user_id" })

  if (error) throw new Error(error.message)
} 