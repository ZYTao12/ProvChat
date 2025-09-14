import { LLM } from "@/types"

const OPENAI_PLATORM_LINK = "https://platform.openai.com/docs/overview"

// OpenAI Models (UPDATED 1/25/24) -----------------------------
const GPT4o: LLM = {
  modelId: "gpt-4o",
  modelName: "GPT-4o",
  provider: "openai",
  hostedId: "gpt-4o",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 5,
    outputCost: 15
  }
}

// GPT-4 Turbo (UPDATED 1/25/24)
const GPT4Turbo: LLM = {
  modelId: "gpt-4-turbo-preview",
  modelName: "GPT-4 Turbo",
  provider: "openai",
  hostedId: "gpt-4-turbo-preview",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 10,
    outputCost: 30
  }
}

// GPT-4 Vision (UPDATED 12/18/23)
const GPT4Vision: LLM = {
  modelId: "gpt-4-vision-preview",
  modelName: "GPT-4 Vision",
  provider: "openai",
  hostedId: "gpt-4-vision-preview",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 10
  }
}

// GPT-4 (UPDATED 1/29/24)
const GPT4: LLM = {
  modelId: "gpt-4",
  modelName: "GPT-4",
  provider: "openai",
  hostedId: "gpt-4",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: false,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 30,
    outputCost: 60
  }
}

// GPT-3.5 Turbo (UPDATED 1/25/24)
const GPT3_5Turbo: LLM = {
  modelId: "gpt-3.5-turbo",
  modelName: "GPT-3.5 Turbo",
  provider: "openai",
  hostedId: "gpt-3.5-turbo",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: false,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0.5,
    outputCost: 1.5
  }
}

// NEWER OPENAI MODELS (ADDED)
const GPT5ChatLatest: LLM = {
  modelId: "gpt-5-chat-latest",
  modelName: "GPT-5 Chat (Latest)",
  provider: "openai",
  hostedId: "gpt-5-chat-latest",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true
}

const ChatGPT4oLatest: LLM = {
  modelId: "chatgpt-4o-latest",
  modelName: "ChatGPT 4o (Latest)",
  provider: "openai",
  hostedId: "chatgpt-4o-latest",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true
}

const GPT5_2025_08_07: LLM = {
  modelId: "gpt-5-2025-08-07",
  modelName: "GPT-5 (2025-08-07)",
  provider: "openai",
  hostedId: "gpt-5-2025-08-07",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: false
}

const GPT5Mini_2025_08_07: LLM = {
  modelId: "gpt-5-mini-2025-08-07",
  modelName: "GPT-5 Mini (2025-08-07)",
  provider: "openai",
  hostedId: "gpt-5-mini-2025-08-07",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: false
}

const GPT5Nano_2025_08_07: LLM = {
  modelId: "gpt-5-nano-2025-08-07",
  modelName: "GPT-5 Nano (2025-08-07)",
  provider: "openai",
  hostedId: "gpt-5-nano-2025-08-07",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: false
}

const GPT41_2025_04_14: LLM = {
  modelId: "gpt-4.1-2025-04-14",
  modelName: "GPT-4.1 (2025-04-14)",
  provider: "openai",
  hostedId: "gpt-4.1-2025-04-14",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: false
}

export const OPENAI_LLM_LIST: LLM[] = [
  // Latest featured first
  GPT5ChatLatest,
  ChatGPT4oLatest,
  GPT5_2025_08_07,
  GPT5Mini_2025_08_07,
  GPT5Nano_2025_08_07,
  GPT41_2025_04_14,
  // Existing
  GPT4o,
  GPT4Turbo,
  GPT4Vision,
  GPT4,
  GPT3_5Turbo
]
