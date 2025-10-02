"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

export default function ProgressPage() {
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    try {
      const pre = typeof window !== "undefined" && localStorage.getItem("preSurveyCompleted") === "true"
      if (!pre) {
        router.replace(`/${params.locale}/${params.workspaceid}/pre-survey`)
        return
      }
      const convo1 = localStorage.getItem("convo1Completed") === "true"
      if (!convo1) {
        router.replace(`/${params.locale}/${params.workspaceid}/chat-alt`)
        return
      }
      const convo2 = localStorage.getItem("convo2Completed") === "true"
      if (!convo2) {
        router.replace(`/${params.locale}/${params.workspaceid}/break`)
        return
      }
      const post = localStorage.getItem("postSurveyCompleted") === "true"
      if (!post) {
        router.replace(`/${params.locale}/${params.workspaceid}/post-survey`)
        return
      }
      router.replace(`/${params.locale}/${params.workspaceid}/post-survey-completed`)
    } catch (e) {
      router.replace(`/${params.locale}/${params.workspaceid}/pre-survey`)
    }
  }, [])

  return null
} 