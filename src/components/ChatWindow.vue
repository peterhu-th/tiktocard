<template>
  <div class="chat-window">
    <div class="chat-header">
      <button class="back-btn" @click="store.showChatWindow = false">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        返回
      </button>
      <div class="chat-title">AI 陪伴</div>
      <div class="header-placeholder"></div>
    </div>

    <div class="chat-list" ref="chatListRef">
      <div 
        v-for="(msg, index) in filteredChatHistory" 
        :key="index"
        class="chat-bubble-wrapper"
        :class="msg.role"
      >
        <div class="chat-bubble">
          {{ msg.content }}
          <span 
            v-if="store.isTyping && msg.role === 'assistant' && index === filteredChatHistory.length - 1" 
            class="typing-cursor"
          >|</span>
        </div>
      </div>
    </div>

    <div class="chat-input-area">
      <input 
        type="text" 
        v-model="inputText" 
        placeholder="和Ta说点什么..." 
        :disabled="store.isTyping"
        @keyup.enter="handleSend"
      />
      <button class="send-btn" :disabled="!inputText.trim() || store.isTyping" @click="handleSend">
        发送
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { useHealingStore } from '../store/useHealingStore'

const store = useHealingStore()
const inputText = ref('')
const chatListRef = ref(null)

const filteredChatHistory = computed(() => {
  const history = store.chatHistory
  if (history.length > 0 && history[0].role === 'user') {
    return history.slice(1)
  }
  return history
})

const scrollToBottom = async () => {
  await nextTick()
  if (chatListRef.value) {
    chatListRef.value.scrollTop = chatListRef.value.scrollHeight
  }
}

// Watch chat history changes to auto-scroll
watch(() => store.chatHistory, () => {
  scrollToBottom()
}, { deep: true })

// Also watch isTyping to scroll when typing animation starts
watch(() => store.isTyping, () => {
  scrollToBottom()
})

const handleSend = () => {
  if (!inputText.value.trim() || store.isTyping) return
  store.sendMessage(inputText.value)
  inputText.value = ''
}
</script>

<style scoped>
.chat-window {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #fff9f5;
  display: flex;
  flex-direction: column;
  z-index: 100;
  box-sizing: border-box;
}

.chat-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background-color: #fff;
  border-bottom: 1px solid #f0e6df;
  flex-shrink: 0;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #8c7b70;
  font-size: 16px;
  cursor: pointer;
  padding: 8px 0;
}

.chat-title {
  font-size: 17px;
  font-weight: 600;
  color: #5c4d43;
}

.header-placeholder {
  width: 60px;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat-bubble-wrapper {
  display: flex;
  width: 100%;
}

.chat-bubble-wrapper.user {
  justify-content: flex-end;
}

.chat-bubble-wrapper.assistant {
  justify-content: flex-start;
}

.chat-bubble {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 20px;
  font-size: 15px;
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;
}

.user .chat-bubble {
  background-color: var(--rose);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.assistant .chat-bubble {
  background-color: #fff;
  color: #5c4d43;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.typing-cursor {
  display: inline-block;
  animation: blink 1s step-end infinite;
  margin-left: 2px;
  font-weight: bold;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.chat-input-area {
  padding: 12px 16px;
  background-color: #fff;
  border-top: 1px solid #f0e6df;
  display: flex;
  gap: 12px;
  flex-shrink: 0;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}

.chat-input-area input {
  flex: 1;
  height: 40px;
  border: 1px solid #e8ddd5;
  border-radius: 20px;
  padding: 0 16px;
  font-size: 15px;
  outline: none;
  background-color: #faf5f0;
  color: #5c4d43;
  transition: border-color 0.2s;
}

.chat-input-area input:focus {
  border-color: #d1bba8;
}

.chat-input-area input:disabled {
  background-color: #f0e6df;
  color: #a0958d;
}

.send-btn {
  width: 64px;
  height: 40px;
  border-radius: 20px;
  background-color: var(--rose);
  color: white;
  border: none;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
