"use client"

import { Button } from "@/components/ui/button"
import { useParams, useRouter } from "next/navigation"

export default function Convo2CompletedPage() {
  const params = useParams()
  const router = useRouter()

  return (
    <div className="relative flex h-full flex-col items-center">
      <div className="bg-secondary flex max-h-[50px] min-h-[50px] w-full items-center justify-center border-b-2 font-bold">
        <div className="max-w-[200px] truncate sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px]">
          Conversation 2
        </div>
      </div>

      <div className="flex size-full flex-col items-center justify-center p-6 text-center">
        <div className="mb-6 text-lg">You have completed your second conversation.</div>
        <div className="mt-8">
          <Button onClick={() => router.push(`/${params.locale}/${params.workspaceid}/post-survey`)}>
            Go to Post-Experiment Survey
          </Button>
        </div>
      </div>
    </div>
  )
} 