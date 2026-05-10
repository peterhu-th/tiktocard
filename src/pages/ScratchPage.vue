<template>
  <div class="page-shell">
    <h2 class="section-title">
      刮开专属<span class="red">身体和解卡</span>
    </h2>
    <p class="section-sub">你已经很不容易了，休息一下吧</p>

    <div class="scratch">
      <div class="paper-wrap">
        <div class="paper-image-fallback"></div>
        <div class="paper">
          <div class="paper-content">
            <div class="heal-line">{{ store.selectedAnxiety.heal }}</div>
          </div>
          <div class="scratch-layer" ref="paperRef" :class="{ started: hasStarted, done: isDone }">
            <canvas
              ref="canvasRef"
              class="scratch-canvas"
              :class="{ open: isDone }"
              @pointerdown.prevent="scratch.pointerDown"
              @pointermove.prevent="scratch.pointerMove"
              @pointerup="scratch.pointerUp"
              @pointercancel="scratch.pointerUp"
              @pointerleave="scratch.pointerUp"
            ></canvas>
            <div class="scratch-hint" :class="{ hidden: hasStarted || isDone }">
              <b>轻轻刮开</b>
              <span>按住并来回滑动，刮开今天的身体和解卡</span>
            </div>
          </div>
        </div>
      </div>
      <div class="decor-heart">♡</div>
      <div class="tip scratch-tip">用手指在卡片上来回滑动，露出专属和解句</div>
    </div>

    <button class="btn" :disabled="!store.scratched" @click="store.go(4)">
      与自己和解
    </button>
    <div class="ghost-row">
      <button class="ghost" @click="store.go(2)">返回上一页</button>
      <button class="ghost" @click="resetAll">重新开始</button>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue'
import { useScratchCard } from '../composables/useScratchCard'
import { useHealingStore } from '../store/useHealingStore'

const store = useHealingStore()
const canvasRef = ref(null)
const paperRef = ref(null)

const scratch = useScratchCard(canvasRef, paperRef, () => {
  store.setScratched(true)
})
const isDone = scratch.isDone
const hasStarted = scratch.hasStarted

onMounted(async () => {
  await nextTick()
  scratch.reset()
})

watch(
  () => store.selectedAnxietyKey,
  () => {
    store.setScratched(false)
    scratch.reset()
  }
)

const resetAll = () => {
  scratch.reset()
  store.resetAll()
}
</script>
