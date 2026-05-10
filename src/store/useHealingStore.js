import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { anxieties, badThoughts } from '../data/healingData'

export const useHealingStore = defineStore('healing', () => {
  const page = ref(1)
  const homeEntry = ref(null)
  const selectedAnxietyKey = ref(null)
  const scratched = ref(false)
  const selectedBadKeys = ref([])
  const crushed = ref(false)
  const showFinal = ref(false)
  
  const healingMessage = ref('')
  const chatHistory = ref([])
  const isTyping = ref(false)
  const showChatWindow = ref(false)

  const selectedAnxiety = computed(() =>
    anxieties.find((item) => item.key === selectedAnxietyKey.value) ?? anxieties[0]
  )

  const selectedBadItems = computed(() => {
    const items = badThoughts.filter((item) => selectedBadKeys.value.includes(item.key))
    return items.length ? items : [badThoughts[0]]
  })

  function go(nextPage) {
    page.value = nextPage
  }

  function startFrom(kind) {
    homeEntry.value = kind
    go(2)
  }

  function selectAnxiety(key) {
    selectedAnxietyKey.value = key
    scratched.value = false
    go(3)
  }

  function setScratched(value) {
    scratched.value = value
  }

  function toggleBad(key) {
    if (crushed.value) return { changed: false, maxed: false }

    if (selectedBadKeys.value.includes(key)) {
      selectedBadKeys.value = selectedBadKeys.value.filter((item) => item !== key)
      return { changed: true, maxed: false }
    }

    if (selectedBadKeys.value.length >= 6) {
      return { changed: false, maxed: true }
    }

    selectedBadKeys.value = [...selectedBadKeys.value, key]
    return { changed: true, maxed: false }
  }

  function crushSelected() {
    if (!selectedBadKeys.value.length) return
    crushed.value = true
  }

  function openFinal() {
    showFinal.value = true
    if (!healingMessage.value) {
      generateHealingMessage()
    }
  }

  function closeFinal() {
    showFinal.value = false
  }

  function resetAll() {
    page.value = 1
    homeEntry.value = null
    selectedAnxietyKey.value = null
    scratched.value = false
    selectedBadKeys.value = []
    crushed.value = false
    showFinal.value = false
    healingMessage.value = ''
    chatHistory.value = []
    isTyping.value = false
    showChatWindow.value = false
  }

  const defaultHealingMessage = '你已经很努力了。今晚先把身体放回柔软里，喝一口温水，慢一点呼吸，把剩下的交给明天。'

  async function generateHealingMessage() {
    const rawTexts = selectedBadItems.value.map(item => item.raw).join('；')
    healingMessage.value = ''
    chatHistory.value = []
    isTyping.value = true

    const systemPrompt = "你是一个温柔、充满同理心的倾听者。用户会告诉你他们当前的负面念头。请用不超过 50 个字回应，语气要像好朋友一样温暖。不要给出具体的建议，仅仅去共情和接纳。风格参考：'你已经很努力了。今晚先把身体放回柔软里，喝一口温水，慢一点呼吸，把剩下的交给明天。'"

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `我的负面念头：${rawTexts}` }
    ]

    chatHistory.value.push({ role: 'user', content: rawTexts })
    chatHistory.value.push({ role: 'assistant', content: '' })

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-v3.2',
          messages,
          stream: true
        })
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let done = false
      let buffer = ''

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        if (value) {
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmedLine = line.trim()
            if (trimmedLine.startsWith('data:')) {
              const dataStr = trimmedLine.slice(5).trim()
              if (dataStr === '[DONE]') {
                continue
              }
              if (!dataStr) continue
              try {
                const data = JSON.parse(dataStr)
                const content = data.choices?.[0]?.delta?.content
                if (content) {
                  healingMessage.value += content
                  chatHistory.value[chatHistory.value.length - 1].content += content
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e, dataStr)
              }
            }
          }
        }
      }
    } catch (e) {
      console.error(e)
      if (!healingMessage.value) {
        healingMessage.value = defaultHealingMessage
      }
      if (!chatHistory.value[chatHistory.value.length - 1].content) {
        chatHistory.value[chatHistory.value.length - 1].content = defaultHealingMessage
      }
    } finally {
      isTyping.value = false
    }
  }

  async function sendMessage(userText) {
    if (!userText.trim() || isTyping.value) return

    chatHistory.value.push({ role: 'user', content: userText })
    chatHistory.value.push({ role: 'assistant', content: '' })
    isTyping.value = true

    const systemPrompt = "你是一个温柔、充满同理心的倾听者。语气要像好朋友一样温暖。不要给出具体的建议，仅仅去共情和接纳。"

    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.value.slice(0, -1).map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ]

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-v4-flash',
          messages,
          stream: true
        })
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let done = false
      let buffer = ''

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        if (value) {
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmedLine = line.trim()
            if (trimmedLine.startsWith('data:')) {
              const dataStr = trimmedLine.slice(5).trim()
              if (dataStr === '[DONE]') {
                continue
              }
              if (!dataStr) continue
              try {
                const data = JSON.parse(dataStr)
                const content = data.choices?.[0]?.delta?.content
                if (content) {
                  chatHistory.value[chatHistory.value.length - 1].content += content
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e, dataStr)
              }
            }
          }
        }
      }
    } catch (e) {
      console.error(e)
      chatHistory.value[chatHistory.value.length - 1].content += "（抱歉，我现在有点累了，稍后再陪你聊好吗？）"
    } finally {
      isTyping.value = false
    }
  }

  return {
    page,
    homeEntry,
    selectedAnxietyKey,
    scratched,
    selectedBadKeys,
    crushed,
    showFinal,
    healingMessage,
    chatHistory,
    isTyping,
    showChatWindow,
    selectedAnxiety,
    selectedBadItems,
    go,
    startFrom,
    selectAnxiety,
    setScratched,
    toggleBad,
    crushSelected,
    openFinal,
    closeFinal,
    resetAll,
    generateHealingMessage,
    sendMessage
  }
})
