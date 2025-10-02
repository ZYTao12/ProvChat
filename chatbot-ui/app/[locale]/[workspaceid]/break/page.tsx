"use client"

import { Button } from "@/components/ui/button"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { getOrCreateExperimentState } from "@/db/experiment"

export default function BreakPage() {
  const params = useParams()
  const router = useRouter()
  const [secondsLeft, setSecondsLeft] = useState<number>(120)

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
        if (!state.convo1_completed) {
          router.replace(`/${params.locale}/${params.workspaceid}/chat-alt`)
          return
        }
      } catch (e) {}
    })()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const formatted = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`

  return (
    <div className="relative flex h-full flex-col items-center">
      <div className="bg-secondary flex max-h-[50px] min-h-[50px] w-full items-center justify-center border-b-2 font-bold">
        <div className="max-w-[200px] truncate sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px]">
          Break
        </div>
      </div>
      <div className="flex size-full flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 text-lg">Please take a short break.</div>
        <div className="text-5xl font-bold">{formatted}</div>
        <div className="mt-8">
          <Button onClick={() => router.push(`/${params.locale}/${params.workspaceid}/chat?new=1`)}>
            Start Conversation 2
          </Button>
        </div>
      </div>
    </div>
  )
} 