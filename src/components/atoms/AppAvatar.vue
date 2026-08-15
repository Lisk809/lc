<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{ url?: string | null; name: string; size?: number }>(), {
  url: null,
  name: '',
  size: 36,
})

const imgFailed = ref(false)
const showImage = computed(() => Boolean(props.url) && !imgFailed.value)

// 无头像时：根据名称哈希生成确定性配色 + 首字符
const initial = computed(() => {
  const text = props.name.trim()
  if (!text) return '?'
  return text.slice(0, 2).toUpperCase()
})

const hue = computed(() => {
  let hash = 0
  for (const ch of props.name) hash = (hash * 31 + ch.charCodeAt(0)) % 997
  return hash % 360
})

const boxStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  fontSize: `${Math.max(11, Math.round(props.size * 0.38))}px`,
}))

const fallbackStyle = computed(() => ({
  background: `hsl(${hue.value} 55% 88%)`,
  color: `hsl(${hue.value} 45% 32%)`,
}))
</script>

<template>
  <span :class="$style.avatar" :style="[boxStyle, showImage ? null : fallbackStyle]">
    <img
      v-if="showImage"
      :src="url ?? undefined"
      :alt="name"
      loading="lazy"
      referrerpolicy="no-referrer"
      @error="imgFailed = true"
    />
    <span v-else :class="$style.initial" aria-hidden="true">{{ initial }}</span>
  </span>
</template>

<style module lang="scss">
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: var(--r-full);
  overflow: hidden;
  background: var(--c-surface-2);
  color: var(--c-steel);
  user-select: none;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.initial {
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1;
}
</style>
