<script setup lang="ts">
import { ref } from 'vue'
import { useUiStore } from '@/stores/ui'
import { uploadFile } from '@/api/upload'
import { formatBytes } from '@/utils/format'
import type { UploadResult } from '@/types'

/**
 * 文件选择 / 拖拽上传
 * mode="select"：仅选择校验，emit select(file|null)，随表单一起提交（帖子/回复/题目附件）
 * mode="upload"：立即上传至 /api/upload，emit uploaded(result)（个人中心文件上传）
 */
const props = withDefaults(defineProps<{ mode?: 'select' | 'upload'; compact?: boolean }>(), {
  mode: 'select',
  compact: false,
})

const emit = defineEmits<{
  select: [file: File | null]
  uploaded: [result: UploadResult]
}>()

const ui = useUiStore()
const inputRef = ref<HTMLInputElement>()
const dragging = ref(false)
const uploading = ref(false)
const progress = ref(0)
const selected = ref<File | null>(null)
const uploaded = ref<UploadResult | null>(null)
/** 上传中的文件名（selected 在 v-if 分支外被类型收窄为 null，单独记录） */
const activeName = ref('')

const ALLOWED = ['.csv', '.json', '.parquet', '.pdf', '.png', '.jpg', '.jpeg']
const MAX_BYTES = 10 * 1024 * 1024 // 与后端 MAX_FILE_BYTES 默认值一致

function validate(file: File): string | null {
  const name = file.name.toLowerCase()
  if (!ALLOWED.some((ext) => name.endsWith(ext))) {
    return '不支持的文件格式（允许 .csv .json .parquet .pdf .png .jpg .jpeg）'
  }
  if (file.size > MAX_BYTES) return '文件超过 10MB 限制'
  return null
}

async function handleFile(file: File) {
  const error = validate(file)
  if (error) {
    ui.toast(`${error}：${file.name}`, 'error')
    return
  }
  if (props.mode === 'select') {
    selected.value = file
    emit('select', file)
    return
  }
  uploading.value = true
  progress.value = 0
  activeName.value = file.name
  try {
    const result = await uploadFile(file, (p) => (progress.value = p))
    uploaded.value = result
    selected.value = file
    emit('uploaded', result)
  } catch {
    // 拦截器已提示
  } finally {
    uploading.value = false
    activeName.value = ''
  }
}

function onInput(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) void handleFile(file)
}

function onDrop(e: DragEvent) {
  dragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) void handleFile(file)
}

function reset() {
  selected.value = null
  uploaded.value = null
  progress.value = 0
  emit('select', null)
}
</script>

<template>
  <div :class="[$style.zone, { [$style.compact]: compact, [$style.dragging]: dragging }]">
    <input
      ref="inputRef"
      type="file"
      :class="$style.input"
      tabindex="-1"
      aria-hidden="true"
      @change="onInput"
    />

    <!-- 已选/已传完成 -->
    <div v-if="selected" :class="$style.selected">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
      <div :class="$style.selectedInfo">
        <p :class="$style.fileName">{{ selected.name }}</p>
        <p :class="$style.fileMeta">
          {{ formatBytes(selected.size) }}
          <template v-if="uploaded"> · 已上传</template>
        </p>
      </div>
      <button type="button" :class="$style.remove" aria-label="移除文件" @click="reset">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
      </button>
    </div>

    <!-- 上传中 -->
    <div v-else-if="uploading" :class="$style.uploading">
      <p :class="$style.fileName">{{ activeName }}</p>
      <div :class="$style.progressTrack" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">
        <div :class="$style.progressFill" :style="{ transform: `scaleX(${progress / 100})` }" />
      </div>
      <p :class="$style.fileMeta">{{ progress }}%</p>
    </div>

    <!-- 空态 -->
    <button
      v-else
      type="button"
      :class="$style.pick"
      @click="inputRef?.click()"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5" /><path d="M12 3v12" /></svg>
      <span :class="$style.pickText">
        <template v-if="compact">点击选择附件</template>
        <template v-else>拖拽文件到此处，或点击选择</template>
      </span>
      <span v-if="!compact" :class="$style.constraints">.csv .json .parquet .pdf .png .jpg .jpeg · 不超过 10MB</span>
    </button>
  </div>
</template>

<style module lang="scss">
.zone {
  width: 100%;
  border: 1px dashed var(--c-border-strong);
  border-radius: var(--r-md);
  background: var(--c-surface);
  transition: border-color $dur var(--ease-out), background-color $dur var(--ease-out);

  &.dragging {
    border-color: var(--c-accent);
    background: var(--c-accent-soft);
  }
}

.compact {
  border-style: solid;
}

.input {
  display: none;
}

.pick {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 2rem 1.5rem;
  color: var(--c-slate);
  transition: color $dur var(--ease-out);

  &:hover {
    color: var(--c-accent);
  }

  svg {
    width: 22px;
    height: 22px;
  }
}

.compact .pick {
  flex-direction: row;
  gap: 0.625rem;
  padding: 0.75rem 1rem;
  min-height: 44px;

  svg {
    width: 16px;
    height: 16px;
  }
}

.pickText {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--c-steel);
}

.constraints {
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
}

.selected {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  min-height: 44px;

  > svg {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    color: var(--c-accent);
  }
}

.selectedInfo {
  min-width: 0;
}

.fileName {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--c-ink);
  overflow-wrap: anywhere;
}

.fileMeta {
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  color: var(--c-slate);
}

.remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin-left: auto;
  flex-shrink: 0;
  border-radius: var(--r-full);
  color: var(--c-slate);
  transition: color $dur var(--ease-out), background-color $dur var(--ease-out);

  &:hover {
    color: var(--c-danger);
    background: var(--c-danger-soft);
  }

  svg {
    width: 16px;
    height: 16px;
  }
}

.uploading {
  display: grid;
  gap: 0.5rem;
  padding: 1rem;
}

.progressTrack {
  position: relative;
  height: 4px;
  border-radius: var(--r-full);
  background: var(--c-surface-2);
  overflow: hidden;
}

.progressFill {
  position: absolute;
  inset: 0;
  transform-origin: left center;
  background: var(--c-accent);
  transition: transform 0.2s var(--ease-out);
}
</style>
