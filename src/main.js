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
      console.log("please provide your openai api key")
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
    try {
      fs.accessSync(`${process.cwd()}/.cache.json`)
      const cache = fs.readFileSync(`${process.cwd()}/.cache.json`, {
        encoding: "utf8",
      })
      if (cache) {
        this._conversations = JSON.parse(cache)
      }
    } catch (err) {}
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

    const responseMessage = data.choices?.[0].message.content
    if (!responseMessage) {
      console.log(data.error.message)
      responseMessage = "something error, please try again"
    }

    conversation.messages.push({ role: "assistant", content: responseMessage })

    this._conversations[matchedIndex].messages = conversation.messages

    const conversations = JSON.stringify(this._conversations)

    fs.writeFile(`${process.cwd()}/.cache.json`, conversations, err => {
      if (err) {
        console.log("error writing cache!")
        console.log(err)
      }
    })

    return responseMessage
  }
}

export default ChatGPT
