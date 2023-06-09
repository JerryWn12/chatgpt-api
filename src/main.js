import fs from "fs"
import { randomUUID } from "node:crypto"

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

const defaultModel = "gpt-3.5-turbo"
const defaultTemperature = "0.8"
const defaultMaxTokens = "1024"
const defaultPrompt =
  "You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible"

class ChatGPT {
  openaiApiKey
  model
  temperature
  maxTokens
  prompt

  _headers
  _current_conversation
  _conversations = []

  constructor({
    openaiApiKey,
    model = defaultModel,
    temperature = defaultTemperature,
    maxTokens = defaultMaxTokens,
    prompt = defaultPrompt,
  }) {
    if (!openaiApiKey) {
      console.log("please set your openai api key")
      process.exit(1)
    }
    this.openaiApiKey = openaiApiKey
    this.model = model
    this.temperature = temperature
    this.maxTokens = maxTokens
    this.prompt = prompt
    this._headers = {
      Authorization: `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    }
  }

  useConversation(conversation) {
    const exist = this._conversations.some(conv => conv.id === conversation)
    if (exist) {
      this._current_conversation = conversation
    } else {
      console.log(`conversation ${conversation} not found`)
    }
  }

  newConversation() {
    const id = randomUUID()
    this._current_conversation = id
    this._conversations.push({
      id,
      messages: [{ role: "system", content: this.prompt }],
    })
    return id
  }

  newConversationWithCustomPrompt(prompt) {
    const id = randomUUID()
    this._current_conversation = id
    this._conversations.push({
      id,
      messages: [{ role: "system", content: prompt }],
    })
    return id
  }

  async sendMessage(message) {
    let matchedIndex

    const conversation = this._conversations.find((conv, index) => {
      matchedIndex = index
      return conv.id === this._current_conversation
    })

    conversation.messages.push({ role: "user", content: message })

    const body = JSON.stringify({
      model: this.model,
      messages: conversation.messages,
    })

    let data

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: this._headers,
        body,
      })
      data = await response.json()
    } catch (error) {
      console.log(error.message)
    }

    let responseMessage = data?.choices?.[0].message.content
    if (!responseMessage) {
      if (data) {
        console.log(data.error.message)
      }
      responseMessage = "something error, please try again"
    }

    conversation.messages.push({ role: "assistant", content: responseMessage })

    this._conversations[matchedIndex].messages = conversation.messages

    return responseMessage
  }
}

export default ChatGPT
