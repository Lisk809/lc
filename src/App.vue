<script setup lang="ts">
import ToastHost from '@/components/organisms/ToastHost.vue'
import CookieConsent from '@/components/organisms/CookieConsent.vue'
import PetalBurst from '@/components/molecules/PetalBurst.vue'
import { useSpellCode } from '@/composables/useSpellCode'

// 彩蛋：在页面任意处键入 "lunatic" 解锁 LUNATIC 难度
useSpellCode()
</script>

<template>
  <RouterView />
  <ToastHost />
  <CookieConsent />
  <PetalBurst />
</template>
