<template>
  <main class="phone" :class="`page-${store.page}`">
    <div class="blob one"></div>
    <div class="blob two"></div>
    <div class="blob three"></div>

    <header class="topbar">
      <div class="pill">
        <span class="dot"></span>
        <span>身体和解 · AI 陪伴体验</span>
      </div>
      <div class="steps">
        <span
          v-for="step in 4"
          :key="step"
          class="step-dot"
          :class="{ active: step === store.page }"
        ></span>
      </div>
    </header>

    <section class="card">
      <component :is="currentPage" />
    </section>

    <div class="final" :class="{ show: store.showFinal }">
      <div class="final-card">
        <button class="close" @click="store.closeFinal()">×</button>
        <div class="final-title">今日和解卡</div>
        <div class="memory-stage" ref="captureRef">
          <div
            class="memory-card-shell"
            :class="{
              saving: isSavingCard,
              tucked: isCardTucked,
              hidden: hasSavedCard
            }"
          >
            <div class="memory-card">
              <div class="memory-card-tag">今日小行动</div>
              <div class="memory-action-bubbles">
                <div v-for="(item, index) in actionItems" :key="`${index}-${item}`" class="memory-action-bubble">
                  · {{ item }}
                </div>
              </div>
              <div class="final-note" :class="{ 'saved-mode': hasSavedCard }">
                {{ store.healingMessage || '你已经很努力了。今晚先把身体放回柔软里，喝一口温水，慢一点呼吸，把剩下的交给明天。' }}
                <span v-if="store.isTyping && !store.showChatWindow" class="typing-cursor">|</span>
              </div>
            </div>
          </div>

          <div
            class="memory-envelope"
            :class="{
              saving: isSavingCard,
              saved: hasSavedCard
            }"
          >
            <div class="memory-envelope-back"></div>
            <div class="memory-envelope-flap"></div>
            <div class="memory-envelope-front"></div>
          </div>
        </div>

        <button class="btn final-save" :class="{ 'hidden-btn': hasSavedCard }" :disabled="isSavingCard" @click="handleSaveCard">
          {{ isSavingCard ? '正在保存...' : '保存这张卡片' }}
        </button>
        <div class="final-actions" :class="{ 'saved-mode': hasSavedCard }">
          <button class="final-bubble bubble-btn" @click="store.showChatWindow = true">和Ta聊聊</button>
          <button class="final-reset bubble-btn" @click="store.resetAll()">再做一次</button>
        </div>
      </div>
    </div>

    <ChatWindow v-if="store.showChatWindow" />
  </main>
</template>

<script setup>
import html2canvas from 'html2canvas'
import { computed, nextTick, ref, watch } from 'vue'
import { useHealingStore } from './store/useHealingStore'
import HomePage from './pages/HomePage.vue'
import AnxietyPage from './pages/AnxietyPage.vue'
import ScratchPage from './pages/ScratchPage.vue'
import CrusherPage from './pages/TransformPage.vue'
import ChatWindow from './components/ChatWindow.vue'

const store = useHealingStore()

const pageMap = {
  1: HomePage,
  2: AnxietyPage,
  3: ScratchPage,
  4: CrusherPage
}

const captureRef = ref(null)
const isSavingCard = ref(false)
const isCardTucked = ref(false)
const hasSavedCard = ref(false)

watch(() => store.showFinal, (newVal) => {
  if (!newVal) {
    setTimeout(resetSaveScene, 300) // 等待弹窗关闭动画结束后重置
  }
})

const currentPage = computed(() => pageMap[store.page] ?? HomePage)
const actionItems = computed(() => store.selectedBadItems.map((item) => item.action))

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))

const downloadCanvas = (canvas) => {
  const link = document.createElement('a')
  link.download = `healing-card-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

const resetSaveScene = () => {
  isSavingCard.value = false
  isCardTucked.value = false
  hasSavedCard.value = false
}

const handleSaveCard = async () => {
  if (isSavingCard.value || !captureRef.value) return

  isSavingCard.value = true
  await nextTick()

  // 保存图片
  const canvas = await html2canvas(captureRef.value, {
    backgroundColor: null,
    scale: Math.min(window.devicePixelRatio || 2, 3),
    useCORS: true,
    onclone: (clonedDoc) => {
      const shell = clonedDoc.querySelector('.memory-card-shell')
      if (shell) {
        shell.classList.remove('saving', 'tucked', 'hidden')
      }
      const env = clonedDoc.querySelector('.memory-envelope')
      if (env) {
        env.classList.remove('saving', 'saved')
      }
    }
  })

  // 卡片缩小并移动到信封中
  isCardTucked.value = true
  await wait(620)

  // 隐藏卡片，放大信封和底部文字
  hasSavedCard.value = true
  isSavingCard.value = false

  downloadCanvas(canvas)
}
</script>

<style>
/* 增加和解卡最小高度 */
.memory-card {
  min-height: 250px !important;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 16px;
  padding-bottom: 24px;
}

/* AI 寄语现在在卡片内部 */
.memory-card .final-note {
  font-size: 14px;
  line-height: 1.6;
  color: #5c4d43;
  margin-top: auto;
  text-align: left;
  padding-top: 12px;
  border-top: 1px dashed rgba(200, 180, 160, 0.4);
}

/* 底部选项气泡化 */
.final-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}

.bubble-btn {
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  padding: 12px 24px;
  color: #8c7b70;
  font-size: 15px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(130, 110, 100, 0.15);
  transition: all 0.2s ease;
  cursor: pointer;
}

.bubble-btn:active {
  transform: scale(0.96);
  background: rgba(255, 255, 255, 1);
}
</style>
