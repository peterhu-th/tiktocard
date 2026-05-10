<template>
  <div class="chat-window">
    <div class="chat-ambient ambient-one" aria-hidden="true"></div>
    <div class="chat-ambient ambient-two" aria-hidden="true"></div>
    <div class="chat-stars" aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="chat-header">
      <button class="back-btn" @click="store.showChatWindow = false">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        返回
      </button>
      <div class="chat-title-wrap">
        <div class="chat-title">AI 陪伴</div>
        <div class="chat-title-glow" aria-hidden="true"></div>
      </div>
      <div class="header-placeholder"></div>
    </div>

    <div class="chat-list" ref="chatListRef">
      <div 
        v-for="(msg, index) in filteredChatHistory" 
        :key="index"
        class="chat-bubble-wrapper"
        :class="msg.role"
      >
        <div v-if="msg.role === 'assistant'" class="chat-avatar" aria-hidden="true"></div>
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
  overflow: hidden;
  background:
    radial-gradient(circle at 14% 12%, rgba(255, 231, 220, 0.95), rgba(255, 231, 220, 0)),
    radial-gradient(circle at 84% 16%, rgba(233, 213, 255, 0.72), rgba(233, 213, 255, 0)),
    radial-gradient(circle at 52% 88%, rgba(255, 243, 205, 0.66), rgba(255, 243, 205, 0)),
    linear-gradient(180deg, #fffaf7 0%, #fff4f6 52%, #fff7ef 100%);
  display: flex;
  flex-direction: column;
  z-index: 120;
  box-sizing: border-box;
}

.chat-window::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 12% 20%, rgba(255, 255, 255, 0.86) 0 1.4px, transparent 1.7px),
    radial-gradient(circle at 80% 24%, rgba(255, 255, 255, 0.76) 0 1.3px, transparent 1.6px),
    radial-gradient(circle at 32% 64%, rgba(255, 255, 255, 0.66) 0 1.1px, transparent 1.4px),
    radial-gradient(circle at 74% 74%, rgba(255, 255, 255, 0.55) 0 1.1px, transparent 1.4px);
  pointer-events: none;
}

.chat-ambient {
  position: absolute;
  border-radius: 999px;
  filter: blur(18px);
  opacity: 0.75;
  pointer-events: none;
}

.ambient-one {
  width: 190px;
  height: 190px;
  top: -56px;
  left: -60px;
  background: radial-gradient(circle, rgba(255, 214, 214, 0.92), rgba(255, 214, 214, 0));
}

.ambient-two {
  width: 240px;
  height: 240px;
  right: -110px;
  bottom: 110px;
  background: radial-gradient(circle, rgba(226, 214, 255, 0.86), rgba(226, 214, 255, 0));
}

.chat-stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.chat-stars span {
  position: absolute;
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 18px rgba(255, 255, 255, 0.85);
  animation: twinkle 4.4s ease-in-out infinite;
}

.chat-stars span:nth-child(1) {
  top: 92px;
  right: 72px;
}

.chat-stars span:nth-child(2) {
  top: 184px;
  left: 30px;
  width: 7px;
  height: 7px;
  animation-delay: 1.2s;
}

.chat-stars span:nth-child(3) {
  right: 34px;
  bottom: 136px;
  width: 8px;
  height: 8px;
  animation-delay: 2.1s;
}

.chat-header {
  position: relative;
  z-index: 10;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px 12px;
  margin: 14px 14px 0;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.58);
  border: 1px solid rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px);
  box-shadow: 0 16px 40px rgba(187, 145, 137, 0.14);
  flex-shrink: 0;
}

.back-btn {
  position: relative;
  z-index: 12;
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #8c7b70;
  font-size: 16px;
  cursor: pointer;
  padding: 10px 14px;
  min-width: 82px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.9);
  pointer-events: auto;
}

.chat-title-wrap {
  position: relative;
  display: grid;
  place-items: center;
}

.chat-title {
  position: relative;
  z-index: 1;
  font-size: 17px;
  font-weight: 600;
  color: #5c4d43;
  letter-spacing: 0.06em;
}

.chat-title-glow {
  position: absolute;
  width: 92px;
  height: 32px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(255, 240, 214, 0.85), rgba(255, 240, 214, 0));
  filter: blur(8px);
}

.header-placeholder {
  width: 88px;
}

.chat-list {
  position: relative;
  z-index: 3;
  flex: 1;
  overflow-y: auto;
  padding: 22px 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat-bubble-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  width: 100%;
}

.chat-bubble-wrapper.user {
  justify-content: flex-end;
}

.chat-bubble-wrapper.assistant {
  justify-content: flex-start;
}

.chat-avatar {
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  margin-bottom: 4px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 42%, rgba(255, 255, 255, 0.92) 0 3px, transparent 3.4px),
    linear-gradient(180deg, #ffe7dc, #f7c9b8);
  border: 1px solid rgba(255, 255, 255, 0.84);
  box-shadow: 0 10px 22px rgba(196, 149, 138, 0.18);
}

.chat-bubble {
  max-width: min(82%, 286px);
  padding: 13px 16px;
  border-radius: 22px;
  font-size: 15px;
  line-height: 1.75;
  word-break: break-word;
  white-space: pre-wrap;
  border: 1px solid rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(18px);
}

.user .chat-bubble {
  background: linear-gradient(135deg, rgba(221, 133, 131, 0.94), rgba(231, 169, 175, 0.92));
  color: #fff;
  border-bottom-right-radius: 8px;
  box-shadow: 0 14px 30px rgba(215, 127, 125, 0.24);
}

.assistant .chat-bubble {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(255, 249, 244, 0.8));
  color: #5c4d43;
  border-bottom-left-radius: 8px;
  box-shadow: 0 16px 34px rgba(197, 163, 153, 0.14);
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
  position: relative;
  z-index: 10;
  margin: 0 14px 14px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(255, 255, 255, 0.74);
  border-radius: 26px;
  box-shadow: 0 16px 36px rgba(184, 143, 132, 0.14);
  backdrop-filter: blur(20px);
  display: flex;
  gap: 12px;
  flex-shrink: 0;
  padding-bottom: calc(14px + env(safe-area-inset-bottom));
}

.chat-input-area input {
  flex: 1;
  height: 46px;
  border: 1px solid rgba(232, 221, 213, 0.92);
  border-radius: 24px;
  padding: 0 18px;
  font-size: 15px;
  outline: none;
  background: linear-gradient(180deg, rgba(255, 251, 247, 0.95), rgba(250, 245, 240, 0.92));
  color: #5c4d43;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.92);
}

.chat-input-area input:focus {
  border-color: #d1bba8;
  box-shadow: 0 0 0 4px rgba(236, 214, 201, 0.45);
}

.chat-input-area input:disabled {
  background-color: #f0e6df;
  color: #a0958d;
}

.send-btn {
  width: 72px;
  height: 46px;
  border-radius: 24px;
  background: linear-gradient(135deg, #e28c89, #efb0b2);
  color: white;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 14px 26px rgba(215, 127, 125, 0.24);
}

.send-btn:not(:disabled):active {
  transform: scale(0.97);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

@keyframes twinkle {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.36;
  }
  50% {
    transform: scale(1.18);
    opacity: 0.92;
  }
}
</style>
