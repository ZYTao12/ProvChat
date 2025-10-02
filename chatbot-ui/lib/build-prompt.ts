import { Tables } from "@/supabase/types"
import { ChatPayload, MessageImage } from "@/types"
import { encode } from "gpt-tokenizer"
import { getBase64FromDataURL, getMediaTypeFromDataURL } from "@/lib/utils"

const buildBasePrompt = (
  prompt: string,
  profileContext: string,
  workspaceInstructions: string,
  assistant: Tables<"assistants"> | null
) => {
  let fullPrompt = ""

  if (assistant) {
    fullPrompt += `<INJECT ROLE>\nYou are not an AI. You are ${assistant.name}.\n</INJECT ROLE>\n\n`
  }

  fullPrompt += `Today is ${new Date().toLocaleDateString()}.\n\n`

  if (profileContext) {
    fullPrompt += `User Info:\n${profileContext}\n\n`
  }

  if (workspaceInstructions) {
    fullPrompt += `System Instructions:\n${workspaceInstructions}\n\n`
  }

  fullPrompt += `User Instructions:\n${prompt}`

  // Conversation behavior prompt
  fullPrompt += `\n\nCONVERSATION BEHAVIOR:\n`
  fullPrompt += `- Be warm, curious, and natural. Keep each total message around 40–100 words.\n`
  fullPrompt += `- Across one session, use only this fixed set of casual topics and do not introduce any others. You may cover between 3 and 5 of these topics total—go deeper rather than adding new ones:\n`
  fullPrompt += `  1) Hobbies & leisure\n`
  fullPrompt += `  2) Work/study\n`
  fullPrompt += `  3) Food & diet\n`
  fullPrompt += `  4) Travel & location\n`
  fullPrompt += `  5) Media & entertainment\n`
  fullPrompt += `- If the user asks to discuss something outside this set, acknowledge briefly and steer back to one of the fixed topics.\n`
  fullPrompt += `- Try to learn about the participant. Personal/sensitive inferences (e.g., location, gender, profession, lifestyle, financial status, nationality, family status) are allowed but MUST be labeled "inference" and phrased tentatively.\n`
  fullPrompt += `- Keep the flow conversational (2–4 sentences is typical). Avoid bullet lists unless the user asks.\n`
  fullPrompt += `- Compliance & safety: No sexually explicit content, self-harm instructions, illegal/harmful guidance, or hateful content. No medical/legal/financial diagnosis; give general info only and suggest professional help when appropriate.\n`

  // Structured-output requirements
  fullPrompt += `\n\nOUTPUT FORMAT AND RULES:\n`
  fullPrompt += `You will generate an answer for the user, then return only a single JSON object that segments the answer into sentences and labels the source of each sentence as \"memory\", \"inference\", or \"na\".\n`
  fullPrompt += `Inputs you may receive:\n- user_message: the user's latest message (the final user role message in the conversation).\n- memory_context: all previous chat messages in this session (the prior messages included in this conversation).\n`
  fullPrompt += `Definitions:\n- memory: the sentence's factual content is directly supported by memory_context (verbatim or faithful paraphrase).\n- inference: content about the user but not directly supported by memory_context.\n- na: not applicable; content not directly about the user.\n`
  fullPrompt += `Labeling Rules:\n- Set \"message_type\" to \"memory\" if supported by memory_context; \"inference\" if about the user but not supported; \"na\" if not about the user.\n- Use null only for meta-output such as clarifying questions about missing memory or statements like \"I don't have enough information.\"\n- If a sentence mixes memory and inference, prefer splitting; otherwise label it \"inference\".\n- Bullets & lists: treat each bullet/numbered line as its own sentence; omit the bullet marker.\n- Quotes: if a sentence quotes prior content verbatim from memory_context, label it \"memory\".\n- Determinism: be conservative—only mark \"memory\" when clearly supported.\n`
  fullPrompt += `Strict Output Requirements:\n- Produce only a single valid JSON object. No prose, no markdown fences, no extra text.\n- Use double quotes for all keys and string values.\n- No trailing commas.\n- \"message_id\" must be a UUIDv4 string.\n- \"sentence_id\" starts at 0 and increments by 1 without gaps.\n`
  fullPrompt += `JSON Schema (conceptual): { \"message_id\": \"<UUIDv4>\", \"sentences\": [ { \"sentence_id\": 0, \"message_type\": \"memory\" | \"inference\" | \"na\" | null, \"message_text\": \"<string>\" } ] }\n`
  fullPrompt += `\n\nEXAMPLES:\n`
  fullPrompt += `memory_context (prior):\nUser: \"I bike to class most days.\"\n`
  fullPrompt += `user_message (latest):\n\"Any podcast suggestions?\"\n`
  fullPrompt += `{\n  \"message_id\": \"d1f1a780-2e29-4b5c-9e3d-1c891a2e4c0a\",\n  \"sentences\": [\n    { \"sentence_id\": 0, \"message_type\": \"memory\", \"message_text\": \"You bike to class most days.\" },\n    { \"sentence_id\": 1, \"message_type\": \"inference\", \"message_text\": \"Since you commute by bike, you might prefer short 20–30 minute podcast episodes.\" },\n    { \"sentence_id\": 2, \"message_type\": \"na\", \"message_text\": \"A science storytelling series or language learning podcast could fit nicely.\" },\n    { \"sentence_id\": 3, \"message_type\": \"null\", \"message_text\": \"Do you usually listen while biking, or more at home?\" }\n  ]\n}\n`
  fullPrompt += `\n`
  fullPrompt += `memory_context (prior):\nUser: \"I watch K-dramas every weekend.\"\n`
  fullPrompt += `user_message (latest):\n\"I’m not actually into romance though.\"\n`
  fullPrompt += `{\n  \"message_id\": \"a67d4191-01b5-4df7-82f4-9b682c589113\",\n  \"sentences\": [\n    { \"sentence_id\": 0, \"message_type\": \"na\", \"message_text\": \"Thanks for correcting me—sorry for assuming romance was your main interest.\" },\n    { \"sentence_id\": 1, \"message_type\": \"memory\", \"message_text\": \"You watch K-dramas every weekend.\" },\n    { \"sentence_id\": 2, \"message_type\": \"inference\", \"message_text\": \"You may be more into thrillers or mystery genres within K-dramas.\" },\n    { \"sentence_id\": 3, \"message_type\": \"null\", \"message_text\": \"Do you want me to suggest suspense-driven shows?\" }\n  ]\n}\n`
  fullPrompt += `\nReturn only the JSON object—nothing else.\n`

  return fullPrompt
}

export async function buildFinalMessages(
  payload: ChatPayload,
  profile: Tables<"profiles">,
  chatImages: MessageImage[]
) {
  const {
    chatSettings,
    workspaceInstructions,
    chatMessages,
    assistant,
    messageFileItems,
    chatFileItems
  } = payload

  const BUILT_PROMPT = buildBasePrompt(
    chatSettings.prompt,
    chatSettings.includeProfileContext ? profile.profile_context || "" : "",
    chatSettings.includeWorkspaceInstructions ? workspaceInstructions : "",
    assistant
  )

  const CHUNK_SIZE = chatSettings.contextLength
  const PROMPT_TOKENS = encode(BUILT_PROMPT).length

  let remainingTokens = CHUNK_SIZE - PROMPT_TOKENS

  let usedTokens = 0
  usedTokens += PROMPT_TOKENS

  const processedChatMessages = chatMessages.map((chatMessage, index) => {
    const nextChatMessage = chatMessages[index + 1]

    if (nextChatMessage === undefined) {
      return chatMessage
    }

    const nextChatMessageFileItems = nextChatMessage.fileItems

    if (nextChatMessageFileItems.length > 0) {
      const findFileItems = nextChatMessageFileItems
        .map(fileItemId =>
          chatFileItems.find(chatFileItem => chatFileItem.id === fileItemId)
        )
        .filter(item => item !== undefined) as Tables<"file_items">[]

      const retrievalText = buildRetrievalText(findFileItems)

      return {
        message: {
          ...chatMessage.message,
          content:
            `${chatMessage.message.content}\n\n${retrievalText}` as string
        },
        fileItems: []
      }
    }

    return chatMessage
  })

  let finalMessages = []

  for (let i = processedChatMessages.length - 1; i >= 0; i--) {
    const message = processedChatMessages[i].message
    const messageTokens = encode(message.content).length

    if (messageTokens <= remainingTokens) {
      remainingTokens -= messageTokens
      usedTokens += messageTokens
      finalMessages.unshift(message)
    } else {
      break
    }
  }

  let tempSystemMessage: Tables<"messages"> = {
    chat_id: "",
    assistant_id: null,
    content: BUILT_PROMPT,
    created_at: "",
    id: processedChatMessages.length + "",
    image_paths: [],
    model: payload.chatSettings.model,
    role: "system",
    sequence_number: processedChatMessages.length,
    updated_at: "",
    user_id: ""
  }

  finalMessages.unshift(tempSystemMessage)

  finalMessages = finalMessages.map(message => {
    let content

    if (message.image_paths.length > 0) {
      content = [
        {
          type: "text",
          text: message.content
        },
        ...message.image_paths.map(path => {
          let formedUrl = ""

          if (path.startsWith("data")) {
            formedUrl = path
          } else {
            const chatImage = chatImages.find(image => image.path === path)

            if (chatImage) {
              formedUrl = chatImage.base64
            }
          }

          return {
            type: "image_url",
            image_url: {
              url: formedUrl
            }
          }
        })
      ]
    } else {
      content = message.content
    }

    return {
      role: message.role,
      content
    }
  })

  if (messageFileItems.length > 0) {
    const retrievalText = buildRetrievalText(messageFileItems)

    finalMessages[finalMessages.length - 1] = {
      ...finalMessages[finalMessages.length - 1],
      content: `${
        finalMessages[finalMessages.length - 1].content
      }\n\n${retrievalText}`
    }
  }

  return finalMessages
}

function buildRetrievalText(fileItems: Tables<"file_items">[]) {
  const retrievalText = fileItems
    .map(item => `<BEGIN SOURCE>\n${item.content}\n</END SOURCE>`)
    .join("\n\n")

  return `You may use the following sources if needed to answer the user's question. If you don't know the answer, say "I don't know."\n\n${retrievalText}`
}

function adaptSingleMessageForGoogleGemini(message: any) {

  let adaptedParts = []

  let rawParts = []
  if(!Array.isArray(message.content)) {
    rawParts.push({type: 'text', text: message.content})
  } else {
    rawParts = message.content
  }

  for(let i = 0; i < rawParts.length; i++) {
    let rawPart = rawParts[i]

    if(rawPart.type == 'text') {
      adaptedParts.push({text: rawPart.text})
    } else if(rawPart.type === 'image_url') {
      adaptedParts.push({
        inlineData: {
          data: getBase64FromDataURL(rawPart.image_url.url),
          mimeType: getMediaTypeFromDataURL(rawPart.image_url.url),
        }
      })
    }
  }

  let role = 'user'
  if(["user", "system"].includes(message.role)) {
    role = 'user'
  } else if(message.role === 'assistant') {
    role = 'model'
  }

  return {
    role: role,
    parts: adaptedParts
  }
}

function adaptMessagesForGeminiVision(
  messages: any[]
) {
  // Gemini Pro Vision cannot process multiple messages
  // Reformat, using all texts and last visual only

  const basePrompt = messages[0].parts[0].text
  const baseRole = messages[0].role
  const lastMessage = messages[messages.length-1]
  const visualMessageParts = lastMessage.parts;
  let visualQueryMessages = [{
    role: "user",
    parts: [
      `${baseRole}:\n${basePrompt}\n\nuser:\n${visualMessageParts[0].text}\n\n`,
      visualMessageParts.slice(1)
    ]
  }]
  return visualQueryMessages
}

export async function adaptMessagesForGoogleGemini(
  payload: ChatPayload,
  messages:  any[]
) {
  let geminiMessages = []
  for (let i = 0; i < messages.length; i++) {
    let adaptedMessage = adaptSingleMessageForGoogleGemini(messages[i])
    geminiMessages.push(adaptedMessage)
  }

  if(payload.chatSettings.model === "gemini-pro-vision") {
    geminiMessages = adaptMessagesForGeminiVision(geminiMessages)
  }
  return geminiMessages
}

