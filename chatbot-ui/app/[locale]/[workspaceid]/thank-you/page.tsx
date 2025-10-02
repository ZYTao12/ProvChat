"use client"

import { Button } from "@/components/ui/button"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function ThankYouPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const handleReparticipate = async () => {
    try {
      await fetch("/api/user/delete", { method: "POST" })
    } catch (e) {}
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("preSurveyCompleted")
        localStorage.removeItem("convo1Completed")
        localStorage.removeItem("convo2Completed")
        localStorage.removeItem("postSurveyCompleted")
      }
    } catch (e) {}
    try {
      await supabase.auth.signOut()
    } catch (e) {}
    router.replace(`/login`)
  }

  return (
    <div className="relative flex h-full flex-col items-center">
      <div className="bg-secondary flex max-h-[50px] min-h-[50px] w-full items-center justify-center border-b-2 font-bold">
        <div className="max-w-[200px] truncate sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px]">
          Thank You
        </div>
      </div>

      <div className="flex size-full flex-col items-center justify-center p-6 text-center text-xl">
        <div className="mb-6">Thank you for your participation!</div>
        <Button onClick={handleReparticipate}>Re‑participate</Button>
      </div>
    </div>
  )
} 