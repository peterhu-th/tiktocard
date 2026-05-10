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
        <div class="final-aurora aurora-one" aria-hidden="true"></div>
        <div class="final-aurora aurora-two" aria-hidden="true"></div>
        <div class="final-sparkle sparkle-one" aria-hidden="true"></div>
        <div class="final-sparkle sparkle-two" aria-hidden="true"></div>
        <button class="close" @click="store.closeFinal()">×</button>
        <div class="final-head">
          <div class="final-title">今日和解卡</div>
          <div class="final-head-decoration" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <div class="memory-stage" ref="captureRef">
          <div class="memory-stage-glow" aria-hidden="true"></div>
          <div
            class="memory-card-shell"
            :class="{
              saving: isSavingCard,
              tucked: isCardTucked,
              hidden: hasSavedCard
            }"
          >
            <div class="memory-card">
              <div class="memory-card-top">
                <div class="memory-card-tag">今日小行动</div>
                <div class="memory-card-stars" aria-hidden="true">
                  <span>✦</span>
                  <span>✧</span>
                </div>
              </div>
              <div class="memory-action-bubbles">
                <div v-for="(item, index) in actionItems" :key="`${index}-${item}`" class="memory-action-bubble">
                  <span class="memory-action-dot" aria-hidden="true"></span>
                  <span>{{ item }}</span>
                </div>
              </div>
              <div class="final-note-panel">
                <div class="final-note" :class="{ 'saved-mode': hasSavedCard }">
                  {{ store.healingMessage || '你已经很努力了。今晚先把身体放回柔软里，喝一口温水，慢一点呼吸，把剩下的交给明天。' }}
                  <span v-if="store.isTyping && !store.showChatWindow" class="typing-cursor">|</span>
                </div>
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
.final {
  align-items: center !important;
  justify-content: center !important;
  padding: 16px !important;
}

.final-card {
  position: relative;
  display: flex !important;
  flex-direction: column !important;
  justify-content: flex-start !important;
  align-items: stretch !important;
  width: min(382px, 100%) !important;
  max-height: calc(100vh - 32px) !important;
  overflow: auto !important;
  margin-top: 0 !important;
  padding: 18px !important;
  padding-bottom: 18px !important;
  background-image: none !important;
  background:
    radial-gradient(circle at 18% 5%, rgba(255, 241, 182, 0.38), transparent 28%),
    radial-gradient(circle at 89% 18%, rgba(233, 213, 255, 0.3), transparent 31%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 247, 241, 0.9)) !important;
}

.final-card::before {
  content: none !important;
}

.final-card::-webkit-scrollbar {
  width: 6px;
}

.final-card::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(170, 146, 136, 0.35);
}

.final-card .close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.final-title {
  margin: 0 !important;
}

.final-aurora,
.final-sparkle,
.memory-stage-glow {
  pointer-events: none;
}

.final-aurora {
  position: absolute;
  border-radius: 999px;
  filter: blur(8px);
  opacity: 0.9;
}

.aurora-one {
  width: 180px;
  height: 180px;
  top: -48px;
  left: -56px;
  background: radial-gradient(circle, rgba(255, 231, 199, 0.88), rgba(255, 231, 199, 0));
}

.aurora-two {
  width: 220px;
  height: 220px;
  right: -90px;
  bottom: 118px;
  background: radial-gradient(circle, rgba(233, 213, 255, 0.72), rgba(233, 213, 255, 0));
}

.final-sparkle {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 22px rgba(255, 255, 255, 0.85);
  opacity: 0.68;
  animation: finalSparkle 4.6s ease-in-out infinite;
}

.sparkle-one {
  top: 82px;
  right: 74px;
}

.sparkle-two {
  left: 52px;
  bottom: 142px;
  width: 9px;
  height: 9px;
  animation-delay: 1.5s;
}

.final-head {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0 42px 12px 0 !important;
}

.final-head-decoration {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.final-head-decoration span {
  display: block;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(255, 228, 214, 0.72));
  box-shadow: 0 6px 18px rgba(210, 162, 155, 0.22);
}

.final-head-decoration span:nth-child(1) {
  width: 8px;
  height: 8px;
}

.final-head-decoration span:nth-child(2) {
  width: 28px;
  height: 6px;
}

.final-head-decoration span:nth-child(3) {
  width: 12px;
  height: 12px;
}

.memory-stage {
  position: relative;
  padding: 0 !important;
  margin-top: 6px !important;
}

.memory-stage-glow {
  position: absolute;
  left: 50%;
  top: 22px;
  width: 82%;
  height: 72%;
  transform: translateX(-50%);
  border-radius: 36px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0));
  filter: blur(16px);
}

.memory-card-shell {
  position: relative;
  z-index: 3;
  padding: 10px;
  border-radius: 34px;
  border: 1.5px solid rgba(231, 207, 193, 0.92);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.56), rgba(255, 247, 241, 0.34));
  box-shadow:
    0 18px 40px rgba(187, 141, 132, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.86);
  transform: none !important;
  transition: transform 0.55s ease, opacity 0.35s ease;
}

.memory-card-shell.tucked {
  transform: translateY(44px) scale(0.88);
}

.memory-card-shell.hidden {
  opacity: 0;
  pointer-events: none;
}

.memory-envelope {
  width: min(78%, 292px);
  height: 154px;
  margin: -34px auto 0;
  position: relative;
  z-index: 2;
  transition: transform 0.5s ease, opacity 0.35s ease;
}

.memory-envelope.saved {
  transform: translateY(-8px) scale(1.03);
}

.memory-envelope-back,
.memory-envelope-flap,
.memory-envelope-front {
  position: absolute;
  left: 0;
  right: 0;
  margin: auto;
  border-radius: 26px;
}

.memory-envelope-back {
  bottom: 10px;
  width: 100%;
  height: 108px;
  border: 1.5px solid rgba(228, 199, 183, 0.92);
  background: linear-gradient(180deg, rgba(255, 249, 243, 0.96), rgba(247, 229, 216, 0.88));
  box-shadow: 0 16px 32px rgba(176, 131, 121, 0.12);
}

.memory-envelope-flap {
  top: 6px;
  width: calc(100% - 18px);
  height: 84px;
  border: 1.5px solid rgba(228, 199, 183, 0.9);
  background: linear-gradient(180deg, rgba(255, 236, 224, 0.96), rgba(255, 248, 240, 0.88));
  clip-path: polygon(50% 0, 100% 72%, 100% 100%, 0 100%, 0 72%);
  transform-origin: top center;
}

.memory-envelope-front {
  bottom: 0;
  width: 100%;
  height: 110px;
  border: 1.5px solid rgba(228, 199, 183, 0.92);
  background:
    linear-gradient(135deg, rgba(255, 252, 249, 0.96), rgba(246, 227, 213, 0.92));
  clip-path: polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.92);
}

.memory-card {
  min-height: 250px !important;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 16px;
  padding-bottom: 24px;
  padding: 18px 18px 26px;
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 247, 241, 0.82)),
    radial-gradient(circle at top right, rgba(255, 237, 215, 0.58), rgba(255, 237, 215, 0));
  border: 1px solid rgba(255, 255, 255, 0.92);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 22px 54px rgba(180, 127, 120, 0.16);
}

.memory-card::before {
  content: '';
  position: absolute;
  inset: 10px;
  border-radius: 24px;
  border: 1px dashed rgba(214, 177, 160, 0.42);
  pointer-events: none;
}

.memory-card::after {
  content: '';
  position: absolute;
  top: -18%;
  right: -6%;
  width: 150px;
  height: 150px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(255, 244, 214, 0.8), rgba(255, 244, 214, 0));
  pointer-events: none;
}

.memory-card-top {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.memory-card-tag {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(255, 231, 233, 0.98), rgba(255, 245, 221, 0.92));
  color: #b1696c;
  letter-spacing: 0.06em;
  box-shadow: 0 10px 24px rgba(215, 154, 145, 0.2);
}

.memory-card-stars {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: rgba(225, 170, 137, 0.95);
  font-size: 14px;
}

.memory-action-bubbles {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 10px;
}

.memory-action-bubble {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.88), rgba(255, 243, 231, 0.72));
  border: 1px solid rgba(255, 255, 255, 0.92);
  box-shadow: 0 12px 24px rgba(201, 163, 151, 0.12);
  color: #7a635a;
  line-height: 1.6;
}

.memory-action-dot {
  width: 8px;
  height: 8px;
  margin-top: 8px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: linear-gradient(180deg, #f1b0a9, #d98d87);
  box-shadow: 0 0 0 5px rgba(241, 176, 169, 0.12);
}

.final-note-panel {
  position: relative;
  z-index: 1;
  margin-top: auto;
  padding: 16px 16px 0;
  border-top: 1px dashed rgba(212, 177, 164, 0.52);
}

/* AI 寄语现在在卡片内部 */
.memory-card .final-note {
  font-size: 14px;
  line-height: 1.9;
  color: #5c4d43;
  padding: 16px 18px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(255, 249, 244, 0.92), rgba(255, 255, 255, 0.88));
  border: 1px solid rgba(255, 255, 255, 0.92);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.92);
}

.final-save {
  position: relative;
  overflow: hidden;
  margin-top: 14px;
  min-height: 50px;
  z-index: 5;
}

.final-save::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 24%, rgba(255, 255, 255, 0.28) 50%, transparent 76%);
  transform: translateX(-110%);
  animation: finalButtonShine 3.8s ease-in-out infinite;
}

.final-actions {
  position: relative;
  z-index: 5;
  display: flex;
  justify-content: center;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 10px;
  padding-top: 0;
}


.bubble-btn {
  min-width: 116px;
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
  backdrop-filter: blur(16px);
}

.bubble-btn:active {
  transform: scale(0.96);
  background: rgba(255, 255, 255, 1);
}

@keyframes finalSparkle {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.35;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.9;
  }
}

@keyframes finalButtonShine {
  0%, 100% {
    transform: translateX(-110%);
  }
  45%, 55% {
    transform: translateX(110%);
  }
}
</style>
