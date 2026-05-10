<template>
  <div class="page-shell">
    <div 
      class="letter-hero interactive-envelope" 
      :class="{ opened: isOpened }"
      @click="openEnvelope"
    >
      <div class="moon-soft" aria-hidden="true"></div>
      <div class="soft-star s1" aria-hidden="true">✦</div>
      <div class="soft-star s2" aria-hidden="true">✧</div>
      <div class="soft-star s3" aria-hidden="true">✦</div>
      <div class="envelope-wrap">
        <div class="envelope-flap" aria-hidden="true"></div>
        <div class="envelope-back" aria-hidden="true"></div>
        <div class="letter-photo" :style="{ backgroundImage: `url('${heroImage}')` }">
          <div class="photo-copy">
            <div class="photo-kicker">AI 疗愈卡片</div>
            <div class="photo-main">
              <span>她不是变胖了</span>
              <span>她只是刚刚完成一场</span>
              <span>生命的接力</span>
            </div>
            <div class="photo-divider"></div>
            <div class="photo-sub">
              <span>不用急着改变自己</span>
              <span>先给身体一点温柔的回应</span>
            </div>
          </div>
        </div>
        <div class="envelope-front" aria-hidden="true"></div>
        <div class="envelope-seal" aria-hidden="true"></div>
        <div class="envelope-hint" aria-hidden="true">轻点打开</div>
      </div>
    </div>
    <h2 class="section-title">
      她不是变胖了<br />
      她只是刚刚完成一场<br />
      <span class="red">生命的接力</span>
    </h2>
    <p class="section-sub">
      不用急着改变自己<br />
      先给身体一点温柔的回应
    </p>
    <div class="home-entry">
      <button class="btn home-start-btn" @click="store.go(2)">我准备好了</button>
      <div class="home-note standalone">倾诉 · 陪伴 · 疗愈</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { heroImage } from '../data/healingData'
import { useHealingStore } from '../store/useHealingStore'

const store = useHealingStore()

const isOpened = ref(false)
const openEnvelope = () => {
  if (!isOpened.value) {
    isOpened.value = true
  }
}
</script>
