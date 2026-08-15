<script setup lang="ts">
import { computed } from 'vue'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { useUiStore } from '@/stores/ui'
import { uploadFile } from '@/api/upload'

const props = withDefaults(
  defineProps<{ modelValue: string; placeholder?: string; height?: string }>(),
  {
    placeholder: '支持 Markdown 语法；可直接粘贴图片，将自动上传',
    height: '420px',
  }
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const ui = useUiStore()

const value = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

// 粘贴/插入图片：上传至 /api/upload 后回填 URL
const onUploadImg = async (files: File[], callback: (urls: string[]) => void) => {
  const urls: string[] = []
  for (const file of files) {
    try {
      const res = await uploadFile(file)
      urls.push(res.url)
    } catch {
      ui.toast('图片上传失败', 'error')
    }
  }
  callback(urls)
}
</script>

<template>
  <div :class="$style.wrap">
    <MdEditor
      v-model="value"
      :theme="ui.isDark ? 'dark' : 'light'"
      :preview-theme="ui.isDark ? 'dark' : 'light'"
      :placeholder="props.placeholder"
      :on-upload-img="onUploadImg"
      :toolbars-exclude="['github', 'save', 'catalog', 'fullscreen', 'htmlPreview']"
      :style="{ height: props.height }"
    />
  </div>
</template>

<style module lang="scss">
.wrap {
  width: 100%;
  border: 1px solid var(--c-border-strong);
  border-radius: var(--r-md);
  overflow: hidden;
  transition: border-color $dur var(--ease-out), box-shadow $dur var(--ease-out);

  &:focus-within {
    @include focus-ring;
  }
}
</style>
