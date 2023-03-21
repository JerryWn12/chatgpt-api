# chatgpt-api

## example

```javascript
import ChatGPT from "@jerrywn/chatgpt-api"

const client = new ChatGPT({
  openaiApiKey: process.env.OPENAI_API_KEY || "",
})

const conv01 = client.newConversation()
const response01 = await client.sendMessage("who are you?")
console.log(response01)

const conv02 = client.newConversation()
const response02 = await client.sendMessage("where are you from?")
console.log(response02)

client.useConversation(conv01)
const response03 = await client.sendMessage("whats my previous question?")
console.log(response03)
```

output

```output
I am an AI language model designed to assist and provide helpful responses to users. How may I assist you?
As an AI language model developed by OpenAI, I don't have a physical presence, so I'm not really "from" anywhere. However, OpenAI is a research organization based in San Francisco, California.
Your previous question was "who are you?"
```

## Usage

`npm install @jerrywn/chatgpt-api`

`import ChatGPT from "@jerrywn/chatgpt-api"`

## API

### `new ChatGPT()`: object

### params

`openaiApiKey`: string

your openai api key from [openai](https://platform.openai.com/account/api-keys), required

`model`: string

model name, optional, default: "gpt-3.5-turbo"

`temperature`: string or number

model temperature, see [openai doc](https://platform.openai.com/docs/api-reference/chat/create#chat/create-temperature), optional, default: 0.7

`maxTokens`: string or number

model max_tokens, see [openai doc](https://platform.openai.com/docs/api-reference/chat/create#chat/create-max_tokens), optional, default: 256

`prompt`: string

model's first system message, see [openai doc](https://platform.openai.com/docs/guides/chat/introduction), optional, default: "You are a helpful assistant"

### functions

#### `newConversation()`: string

> create a new conversation, represented by uuid

params:

- none

return:

- the conversation's uuid

---

#### `useConversation(conversation)`

> choice which conversation to send message

params:

- `conversation`: string
  - the conversation id returned by `newConversation()`

return:

- none

---

#### `sendMessage(message)`

params:

- `message`: string

  - the message send to chatgpt

return: string

- reply message by chatgpt
