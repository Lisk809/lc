<script setup lang="ts">
import { useCssModule } from 'vue'

withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    type?: string
    placeholder?: string
    error?: string
    hint?: string
    disabled?: boolean
    autocomplete?: string
    textarea?: boolean
    rows?: number
  }>(),
  { type: 'text', textarea: false, rows: 5 }
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement | HTMLTextAreaElement).value)
}

const styles = useCssModule()
</script>

<template>
  <div :class="styles.field">
    <label v-if="label" :class="styles.label">{{ label }}</label>
    <textarea
      v-if="textarea"
      :rows="rows"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[styles.control, styles.area, { [styles.invalid]: error }]"
      @input="onInput"
    />
    <input
      v-else
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :autocomplete="autocomplete"
      :class="[styles.control, { [styles.invalid]: error }]"
      @input="onInput"
    />
    <p v-if="error" :class="styles.error">{{ error }}</p>
    <p v-else-if="hint" :class="styles.hint">{{ hint }}</p>
  </div>
</template>

<style module lang="scss">
.field {
  display: grid;
  gap: 0.5rem; // 标签-输入-错误 标准间距
  width: 100%;
}

.label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--c-ink);
}

.control {
  width: 100%;
  min-height: 44px;
  padding: 0.625rem 0.875rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border-strong);
  border-radius: var(--r-sm);
  color: var(--c-ink);
  transition: border-color $dur var(--ease-out), box-shadow $dur var(--ease-out);

  &::placeholder {
    color: var(--c-slate);
  }

  &:focus-visible {
    @include focus-ring;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.area {
  min-height: 8rem;
  resize: vertical;
  line-height: 1.65;
}

.invalid {
  border-color: var(--c-danger);

  &:focus-visible {
    border-color: var(--c-danger);
    box-shadow: 0 0 0 2px var(--c-danger-soft);
  }
}

.error {
  color: var(--c-danger);
  font-size: 0.8125rem;
}

.hint {
  color: var(--c-slate);
  font-size: 0.8125rem;
}
</style>
