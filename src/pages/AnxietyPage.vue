<template>
  <div class="page-shell">
    <h2 class="section-title">
      你真正<span class="red">在意</span>的<br />
      可能不只是体重
    </h2>
    <p class="section-sub">你会为了这些而不舒服吗？和 AI 聊聊吧！</p>

    <div class="bubble-area">
      <button
        v-for="(item, index) in anxieties"
        :key="item.key"
        class="anxiety"
        :class="[getShape(index), { selected: store.selectedAnxietyKey === item.key }]"
        :style="bubbleStyle(index)"
        @click="store.selectAnxiety(item.key)"
      >
        <small>{{ item.label || '感受' }}</small>
        <span>{{ item.text }}</span>
      </button>
    </div>

    <div class="anxiety-cta-row">
      <button class="btn" :disabled="!store.selectedAnxietyKey" @click="store.go(3)">
        {{ store.selectedAnxietyKey ? '把这个念头轻轻放下' : '先选择一个念头' }}
      </button>
    </div>
    
    <div class="tip anxiety-tip">这些感受很真实，也很普通。<br />
      你完全不用为它们感到羞愧。</div>
    <div class="ghost-row">
      <button class="ghost" @click="store.go(1)">返回上一页</button>
    </div>
  </div>
</template>

<script setup>
import { anxieties, bubblePositions } from '../data/healingData'
import { useHealingStore } from '../store/useHealingStore'

const store = useHealingStore()

const getShape = (index) => {
  return bubblePositions[index]?.shape || 'shape-bubble'
}

const bubbleStyle = (index) => {
  const meta = bubblePositions[index] ?? {
    top: `${10 + index * 12}%`,
    left: '12%',
    width: '240px',
    delay: '0s',
    rot: '0deg'
  }
  return {
    top: meta.top,
    left: meta.left,
    width: meta.width,
    whiteSpace: 'normal',
    animationDelay: meta.delay,
    '--rot': meta.rot || '0deg'
  }
}
</script>
