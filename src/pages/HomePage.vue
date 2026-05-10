<template>
  <div class="page-shell">
    <div class="hero-img" :style="{ backgroundImage: `url('${heroImage}')` }">
      <div class="hero-tag">AI 疗愈卡片</div>
    </div>
    <h1 class="title">
      她不是变胖了<br />
      她只是刚刚完成一场<br />
      <span class="em">生命的接力</span>
    </h1>
    <p class="subtitle">
      不用急着改变自己<br />
      先给身体一点温柔的回应
    </p>
    <div class="home-entry">
      <button class="btn home-start-btn" @click="store.go(2)">我准备好了</button>
      <div class="home-note">倾诉 · 陪伴 · 疗愈</div>
    </div>
  </div>
</template>

<script setup>
import { heroImage } from '../data/healingData'
import { useHealingStore } from '../store/useHealingStore'

const store = useHealingStore()
</script>
