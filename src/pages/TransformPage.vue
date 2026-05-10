<template>
  <div class="page-shell">
    <h2 class="section-title">
      把这些<span class="red">声音</span><br />
      交给 AI 温柔转化
    </h2>
    <div class="crusher-area" ref="transformAreaRef">
      <div class="bad-zone" id="badZone">
        <button
          v-for="item in badThoughts"
          :key="item.key"
          v-show="isSelected(item.key) || (!isAnimating && !store.crushed)"
          class="bad-card"
          :ref="(el) => setBubbleRef(el, item.key)"
          :class="{
            selected: isSelected(item.key) && !store.crushed,
            softened: isSelected(item.key) && store.crushed,
            faded: !isSelected(item.key) && (isAnimating || store.crushed),
            ghosting: animatingKeys.includes(item.key),
            locked: isAnimating || store.crushed
          }"
          @click="toggle(item.key)"
        >
          <small>{{ isSelected(item.key) && store.crushed ? 'AI 转化' : (item.label || '念头') }}</small>
          <div class="bad-text">{{ bubbleText(item) }}</div>
        </button>
      </div>

      <div class="machine" :class="{ crushing: store.crushed || isAnimating }">
        <div class="machine-face"></div>
        <div class="machine-slot" ref="slotRef"></div>
        <div class="machine-label">{{ machineLabel }}</div>
      </div>

      <div class="transform-overlay">
        <div
          v-for="bubble in flyingBubbles"
          :key="bubble.id"
          class="flying-bubble bad-card"
          :class="bubble.kind"
          :style="bubble.style"
        >
          <small>{{ bubble.label }}</small>
          <div class="bad-text">{{ bubble.text }}</div>
        </div>
      </div>
    </div>

    <div class="crusher-cta-row">
      <button class="btn" :disabled="!store.selectedBadKeys.length" @click="handleAction">
        {{ store.crushed ? '下一页' : '交给 AI 温柔化开' }}
      </button>
    </div>
    <div class="ghost-row">
      <button class="ghost" @click="store.go(3)">返回上一页</button>
      <button class="ghost" @click="store.resetAll()">重新开始</button>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'
import { badThoughts } from '../data/healingData'
import { useHealingStore } from '../store/useHealingStore'

const store = useHealingStore()
const transformAreaRef = ref(null)
const slotRef = ref(null)
const bubbleRefs = new Map()
const flyingBubbles = ref([])
const animatingKeys = ref([])
const isAnimating = ref(false)

const machineLabel = computed(() => {
  if (!store.selectedBadKeys.length) return '轻点卡片选中'
  if (isAnimating.value) return '正在温柔转化这些念头...'
  if (store.crushed) return '已转化，正在生成今日和解卡'
  return `已选择 ${store.selectedBadKeys.length} 个念头，准备转化`
})

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))
const nextFrame = () =>
  new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve())
  })

const isSelected = (key) => store.selectedBadKeys.includes(key)

const bubbleText = (item) => {
  if (store.crushed && isSelected(item.key)) return item.soft
  return item.raw
}

const setBubbleRef = (el, key) => {
  if (el) {
    bubbleRefs.set(key, el)
    return
  }
  bubbleRefs.delete(key)
}

const measureSelectedBubbles = () => {
  const areaRect = transformAreaRef.value?.getBoundingClientRect()
  const slotRect = slotRef.value?.getBoundingClientRect()
  if (!areaRect || !slotRect) return []

  const slotCenterX = slotRect.left - areaRect.left + slotRect.width / 2
  const slotCenterY = slotRect.top - areaRect.top + slotRect.height / 2

  return store.selectedBadKeys
    .map((key) => {
      const bubbleEl = bubbleRefs.get(key)
      const item = badThoughts.find((entry) => entry.key === key)
      if (!bubbleEl || !item) return null

      const rect = bubbleEl.getBoundingClientRect()
      const x = rect.left - areaRect.left
      const y = rect.top - areaRect.top
      const startX = slotCenterX - rect.width / 2
      const startY = slotCenterY - rect.height / 2

      return {
        key,
        item,
        x,
        y,
        width: rect.width,
        height: rect.height,
        dxToSlot: slotCenterX - (x + rect.width / 2),
        dyToSlot: slotCenterY - (y + rect.height / 2),
        startX,
        startY,
        dxFromSlot: x - startX,
        dyFromSlot: y - startY
      }
    })
    .filter(Boolean)
}

const animateTransform = async () => {
  if (isAnimating.value || store.crushed || !store.selectedBadKeys.length) return
  await nextTick()

  const metrics = measureSelectedBubbles()
  if (!metrics.length) {
    store.crushSelected()
    return
  }

  isAnimating.value = true
  animatingKeys.value = metrics.map((entry) => entry.key)

  // 1. 先生成 outgoing 气泡，位于卡片原位置
  flyingBubbles.value = metrics.map((entry) => ({
    id: `${entry.key}-out`,
    kind: 'outgoing',
    label: '负面念头',
    text: entry.item.raw,
    style: {
      left: `${entry.x}px`,
      top: `${entry.y}px`,
      width: `${entry.width}px`,
      height: `${entry.height}px`,
      transform: 'translate(0px, 0px) scale(1)',
      opacity: 1
    }
  }))

  await nextFrame()
  
  // 2. outgoing 气泡移动到下方的孔中
  flyingBubbles.value = metrics.map((entry) => ({
    id: `${entry.key}-out`,
    kind: 'outgoing active',
    label: '负面念头',
    text: entry.item.raw,
    style: {
      left: `${entry.x}px`,
      top: `${entry.y}px`,
      width: `${entry.width}px`,
      height: `${entry.height}px`,
      transform: `translate(${entry.dxToSlot}px, ${entry.dyToSlot}px) scale(0.24)`,
      opacity: 0
    }
  }))

  // 等待吸入动画完成
  await wait(560)

  // 3. 生成 incoming 气泡，位于孔中
  flyingBubbles.value = metrics.map((entry) => ({
    id: `${entry.key}-in`,
    kind: 'incoming',
    label: 'AI 转化',
    text: entry.item.soft,
    style: {
      left: `${entry.startX}px`,
      top: `${entry.startY}px`,
      width: `${entry.width}px`,
      height: `${entry.height}px`,
      transform: 'translate(0px, 0px) scale(0.24)',
      opacity: 0
    }
  }))

  await nextFrame()

  // 4. incoming 气泡从孔中弹出到原位置
  flyingBubbles.value = metrics.map((entry) => ({
    id: `${entry.key}-in`,
    kind: 'incoming active',
    label: 'AI 转化',
    text: entry.item.soft,
    style: {
      left: `${entry.startX}px`,
      top: `${entry.startY}px`,
      width: `${entry.width}px`,
      height: `${entry.height}px`,
      transform: `translate(${entry.dxFromSlot}px, ${entry.dyFromSlot}px) scale(1)`,
      opacity: 1
    }
  }))

  // 等待弹出动画完成
  await wait(560)

  store.crushSelected()
  flyingBubbles.value = []
  animatingKeys.value = []
  isAnimating.value = false
}

const toggle = (key) => {
  if (isAnimating.value || store.crushed) return
  const result = store.toggleBad(key)
  if (result.maxed) {
    alert('最多选择 6 个念头，已经足够被看见')
  }
}

const handleAction = () => {
  if (!store.selectedBadKeys.length) return
  if (!store.crushed) {
    animateTransform()
    return
  }
  store.openFinal()
}
</script>

<style scoped>
#badZone {
  display: flex !important;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}
#badZone .bad-card {
  width: calc(50% - 5px);
  box-sizing: border-box;
  text-align: center;
}
.bad-card small {
  display: block;
  margin: 0 auto 11px auto;
}
.flying-bubble {
  position: absolute;
  z-index: 10;
  transition: transform 0.56s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.56s ease;
  margin: 0;
}
.transform-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
</style>
