import { AssistantPicker } from "./assistant-picker"
import { FilePicker } from "./file-picker"
import { PromptPicker } from "./prompt-picker"
import { ChatbotUIContext } from "@/context/context"
import { usePromptAndCommand } from "./chat-hooks/use-prompt-and-command"
import { FC, useContext } from "react"

interface ChatCommandInputProps {}

export const ChatCommandInput: FC<ChatCommandInputProps> = ({}) => {
  const {
    newMessageFiles,
    chatFiles,
    slashCommand,
    isFilePickerOpen,
    setIsFilePickerOpen,
    hashtagCommand,
    focusPrompt,
    focusFile
  } = useContext(ChatbotUIContext)

  const { handleSelectUserFile, handleSelectUserCollection } =
    usePromptAndCommand()

  return (
    <>
      <PromptPicker />

      <FilePicker
        isOpen={isFilePickerOpen}
        searchQuery={hashtagCommand}
        onOpenChange={setIsFilePickerOpen}
        selectedFileIds={[...newMessageFiles, ...chatFiles].map(
          file => file.id
        )}
        selectedCollectionIds={[]}
        onSelectFile={handleSelectUserFile}
        onSelectCollection={handleSelectUserCollection}
        isFocused={focusFile}
      />

      <AssistantPicker />
    </>
  )
}
