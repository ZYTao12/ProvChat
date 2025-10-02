"use client"

import { Dashboard } from "@/components/ui/dashboard"
import { ChatbotUIContext } from "@/context/context"
import { getAssistantWorkspacesByWorkspaceId } from "@/db/assistants"
import { getChatsByWorkspaceId } from "@/db/chats"
import { getCollectionWorkspacesByWorkspaceId } from "@/db/collections"
import { getFileWorkspacesByWorkspaceId } from "@/db/files"
import { getFoldersByWorkspaceId } from "@/db/folders"
import { getModelWorkspacesByWorkspaceId } from "@/db/models"
import { getPresetWorkspacesByWorkspaceId } from "@/db/presets"
import { getPromptWorkspacesByWorkspaceId } from "@/db/prompts"
import { getAssistantImageFromStorage } from "@/db/storage/assistant-images"
import { getToolWorkspacesByWorkspaceId } from "@/db/tools"
import { getWorkspaceById } from "@/db/workspaces"
import { convertBlobToBase64 } from "@/lib/blob-to-b64"
import { supabase } from "@/lib/supabase/browser-client"
import { LLMID } from "@/types"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ReactNode, useContext, useEffect, useState } from "react"
import Loading from "../loading"

interface WorkspaceLayoutProps {
  children: ReactNode
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const router = useRouter()

  const params = useParams()
  const searchParams = useSearchParams()
  const workspaceId = params.workspaceid as string

  const {
    setChatSettings,
    setAssistants,
    setAssistantImages,
    setChats,
    setCollections,
    setFolders,
    setFiles,
    setPresets,
    setPrompts,
    setTools,
    setModels,
    selectedWorkspace,
    setSelectedWorkspace,
    setSelectedChat,
    setChatMessages,
    setUserInput,
    setIsGenerating,
    setFirstTokenReceived,
    setChatFiles,
    setChatImages,
    setNewMessageFiles,
    setNewMessageImages,
    setShowFilesDisplay
  } = useContext(ChatbotUIContext)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const session = (await supabase.auth.getSession()).data.session

      if (!session) {
        return router.push("/login")
      } else {
        await fetchWorkspaceData(workspaceId)
      }
    })()
  }, [])

  useEffect(() => {
    ;(async () => await fetchWorkspaceData(workspaceId))()

    setUserInput("")
    setChatMessages([])
    setSelectedChat(null)

    setIsGenerating(false)
    setFirstTokenReceived(false)

    setChatFiles([])
    setChatImages([])
    setNewMessageFiles([])
    setNewMessageImages([])
    setShowFilesDisplay(false)
  }, [workspaceId])

  const fetchWorkspaceData = async (workspaceId: string) => {
    setLoading(true)
    try {
      const workspace = await getWorkspaceById(workspaceId)
      setSelectedWorkspace(workspace)

      // Preload basic lists
      const [assistantData, chats, collectionData, folders, fileData, presetData, promptData, toolData, modelData] =
        await Promise.all([
          getAssistantWorkspacesByWorkspaceId(workspaceId),
          getChatsByWorkspaceId(workspaceId),
          getCollectionWorkspacesByWorkspaceId(workspaceId),
          getFoldersByWorkspaceId(workspaceId),
          getFileWorkspacesByWorkspaceId(workspaceId),
          getPresetWorkspacesByWorkspaceId(workspaceId),
          getPromptWorkspacesByWorkspaceId(workspaceId),
          getToolWorkspacesByWorkspaceId(workspaceId),
          getModelWorkspacesByWorkspaceId(workspaceId)
        ])

      setAssistants(assistantData.assistants)
      setChats(chats)
      setCollections(collectionData.collections)
      setFolders(folders)
      setFiles(fileData.files)
      setPresets(presetData.presets)
      setPrompts(promptData.prompts)
      setTools(toolData.tools)
      setModels(modelData.models)

      // Do not block loading on assistant image fetches; run in background
      ;(async () => {
        for (const assistant of assistantData.assistants) {
          try {
            let url = ""
            if (assistant.image_path) {
              url = (await getAssistantImageFromStorage(assistant.image_path)) || ""
            }

            if (url) {
              try {
                const response = await fetch(url)
                const blob = await response.blob()
                const base64 = await convertBlobToBase64(blob)
                setAssistantImages(prev => [
                  ...prev,
                  {
                    assistantId: assistant.id,
                    path: assistant.image_path,
                    base64,
                    url
                  }
                ])
              } catch (e) {
                setAssistantImages(prev => [
                  ...prev,
                  {
                    assistantId: assistant.id,
                    path: assistant.image_path,
                    base64: "",
                    url
                  }
                ])
              }
            } else {
              setAssistantImages(prev => [
                ...prev,
                {
                  assistantId: assistant.id,
                  path: assistant.image_path,
                  base64: "",
                  url
                }
              ])
            }
          } catch (e) {
            // ignore single assistant image errors
          }
        }
      })()

      setChatSettings({
        model: ((searchParams.get("model") as string) ||
          "gpt-5-2025-08-07") as LLMID,
        prompt:
          workspace?.default_prompt ||
          "You are a friendly, helpful AI assistant.",
        temperature: workspace?.default_temperature || 1,
        contextLength: workspace?.default_context_length || 4096,
        includeProfileContext: workspace?.include_profile_context || true,
        includeWorkspaceInstructions:
          workspace?.include_workspace_instructions || true,
        embeddingsProvider:
          (workspace?.embeddings_provider as "openai" | "local") || "openai"
      })
    } catch (e) {
      // In case of any failure, still unblock UI
      console.error("Error fetching workspace data", e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading />
  }

  return <Dashboard>{children}</Dashboard>
}
