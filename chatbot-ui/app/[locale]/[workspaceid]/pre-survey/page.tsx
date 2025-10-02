"use client"

import { Button } from "@/components/ui/button"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { getOrCreateExperimentState, setExperimentFlag } from "@/db/experiment"

export default function PreSurveyPage() {
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      try {
        const supabase = createClient()
        const {
          data: { session }
        } = await supabase.auth.getSession()
        if (!session?.user?.id) {
          router.replace(`/login`)
          return
        }
        const state = await getOrCreateExperimentState(session.user.id)
        if (state.pre_survey_completed) {
          router.replace(`/${params.locale}/${params.workspaceid}/pre-survey-completed`)
        }
      } catch (e) {}
    })()
  }, [])

  return (
    <div className="relative flex h-full flex-col items-center">
      <div className="bg-secondary flex max-h-[50px] min-h-[50px] w-full items-center justify-center border-b-2 font-bold">
        <div className="max-w-[200px] truncate sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px]">
          Pre-Experiment Survey
        </div>
      </div>

      <div className="flex size-full flex-col items-center justify-center p-6 text-center">
        <div className="mb-6 text-lg">
          Please complete the pre-experiment survey before starting the conversation.
        </div>
        <a
          className="text-primary underline"
          href="https://qualtrics.example.com/pre"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Pre-Experiment Survey (placeholder)
        </a>
        <div className="mt-8">
          <Button
            onClick={async () => {
              try {
                const supabase = createClient()
                const {
                  data: { session }
                } = await supabase.auth.getSession()
                if (!session?.user?.id) {
                  router.replace(`/login`)
                  return
                }
                await setExperimentFlag(session.user.id, { pre_survey_completed: true })
              } catch (e) {}
              router.push(`/${params.locale}/${params.workspaceid}/chat-alt`)
            }}
          >
            Start Conversation 1
          </Button>
        </div>
      </div>
    </div>
  )
} 