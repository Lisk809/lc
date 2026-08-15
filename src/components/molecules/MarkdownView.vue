<script setup lang="ts">
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { useUiStore } from '@/stores/ui'

defineProps<{ content: string }>()

const ui = useUiStore()
</script>

<template>
  <MdPreview
    :model-value="content"
    :theme="ui.isDark ? 'dark' : 'light'"
    :preview-theme="ui.isDark ? 'dark' : 'light'"
    editor-id="lunacho-preview"
  />
</template>
