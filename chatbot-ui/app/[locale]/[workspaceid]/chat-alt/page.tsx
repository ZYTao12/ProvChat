"use client"

import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { ChatInput } from "@/components/chat/chat-input"
import { ChatMessages } from "@/components/chat/chat-messages"
import { Brand } from "@/components/ui/brand"
import { ChatbotUIContext } from "@/context/context"
import useHotkey from "@/lib/hooks/use-hotkey"
import { useContext, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useParams, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { v4 as uuidv4 } from "uuid"
import { ChatMessage } from "@/types"
import { createClient } from "@/lib/supabase/client"
import { getOrCreateExperimentState, setExperimentFlag } from "@/db/experiment"

export default function ChatAltPage() {
  useHotkey("o", () => handleNewChat())
  useHotkey("l", () => {
    handleFocusChatInput()
  })

  const { chatMessages, setChatMessages, chatSettings } = useContext(ChatbotUIContext)

  const { handleNewChat, handleFocusChatInput } = useChatHandler()

  const params = useParams()
  const router = useRouter()
  const { theme } = useTheme()

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
        if (!state.pre_survey_completed) {
          router.replace(`/${params.locale}/${params.workspaceid}/pre-survey`)
          return
        }
        if (state.convo1_completed) {
          router.replace(`/${params.locale}/${params.workspaceid}/convo1-completed`)
        }
      } catch (e) {}
    })()
  }, [])

  useEffect(() => {
    if (chatMessages.length === 0) {
      const greeting: ChatMessage = {
        message: {
          chat_id: "",
          assistant_id: null,
          content:
            "Hi there! Welcome to the study! I'm glad to chat with you today.  What hobbies or activities do you enjoy in your free time?",
          created_at: "",
          id: uuidv4(),
          image_paths: [],
          model: chatSettings?.model ?? "gpt-5-2025-08-07",
          role: "assistant",
          sequence_number: 0,
          updated_at: "",
          user_id: ""
        },
        fileItems: []
      }
      setChatMessages([greeting])
    }
  }, [])

  return (
    <>
      {chatMessages.length === 0 ? (
        <div className="relative flex h-full flex-col items-center justify-center">
          <div className="top-50% left-50% -translate-x-50% -translate-y-50% absolute mb-20">
            <Brand theme={theme === "dark" ? "dark" : "light"} />
          </div>

          <div className="flex grow flex-col items-center justify-center" />

          <div className="w-full min-w-[300px] items-end px-2 pb-3 pt-0 sm:w-[600px] sm:pb-8 sm:pt-5 md:w-[700px] lg:w-[700px] xl:w-[800px]">
            <ChatInput />
          </div>
        </div>
      ) : (
        <div className="relative flex h-full flex-col items-center">
          <div className="absolute right-4 top-3 z-10">
            <Button
              size="sm"
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
                  await setExperimentFlag(session.user.id, { convo1_completed: true })
                } catch (e) {}
                router.push(`/${params.locale}/${params.workspaceid}/break`)
              }}
            >
              Submit
            </Button>
          </div>

          <div className="bg-secondary flex max-h-[50px] min-h-[50px] w-full items-center justify-center border-b-2 font-bold">
            <div className="max-w-[200px] truncate sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px]">
              Chat
            </div>
          </div>

          <div className="flex size-full flex-col overflow-auto border-b">
            <ChatMessages renderPlainFromJson />
          </div>

          <div className="relative w-full min-w-[300px] items-end px-2 pb-3 pt-0 sm:w-[600px] sm:pb-8 sm:pt-5 md:w-[700px] lg:w-[700px] xl:w-[800px]">
            <ChatInput />
          </div>
        </div>
      )}
    </>
  )
} 