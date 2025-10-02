"use client"

import { Button } from "@/components/ui/button"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { getOrCreateExperimentState, setExperimentFlag } from "@/db/experiment"

export default function PostSurveyPage() {
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
        if (!state.convo2_completed) {
          router.replace(`/${params.locale}/${params.workspaceid}/chat`)
          return
        }
        if (state.post_survey_completed) {
          router.replace(`/${params.locale}/${params.workspaceid}/post-survey-completed`)
        }
      } catch (e) {}
    })()
  }, [])

  return (
    <div className="relative flex h-full flex-col items-center">
      <div className="bg-secondary flex max-h-[50px] min-h-[50px] w-full items-center justify-center border-b-2 font-bold">
        <div className="max-w-[200px] truncate sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px]">
          Post-Experiment Survey
        </div>
      </div>

      <div className="flex size-full flex-col items-center justify-center p-6 text-center">
        <div className="mb-6 text-lg">
          Please complete the post-experiment survey.
        </div>
        <a
          className="text-primary underline"
          href="https://qualtrics.example.com/post"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Post-Experiment Survey (placeholder)
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
                await setExperimentFlag(session.user.id, { post_survey_completed: true })
              } catch (e) {}
              router.push(`/${params.locale}/${params.workspaceid}/thank-you`)
            }}
          >
            Continue to Thank You
          </Button>
        </div>
      </div>
    </div>
  )
} 