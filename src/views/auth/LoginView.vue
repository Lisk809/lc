<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { AxiosError } from 'axios'
import { useUserStore } from '@/stores/user'
import type { ApiErrorBody } from '@/types'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const user = useUserStore()

const form = reactive({ username: '', password: '' })
const error = ref('')
const loading = ref(false)

async function submit() {
  if (!form.username.trim() || !form.password) {
    error.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await user.login({ username: form.username.trim(), password: form.password })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    router.push(redirect)
  } catch (e) {
    const message = (e as AxiosError<ApiErrorBody>).response?.data?.error
    error.value = typeof message === 'string' ? message : '登录失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div :class="$style.auth">
    <header :class="$style.head">
      <h1 :class="$style.title">欢迎回来</h1>
      <p :class="$style.sub">登录以继续使用 Lunatic ChO</p>
    </header>

    <form :class="$style.form" novalidate @submit.prevent="submit">
      <BaseInput
        v-model="form.username"
        label="用户名"
        placeholder="输入用户名"
        autocomplete="username"
      />
      <BaseInput
        v-model="form.password"
        label="密码"
        type="password"
        placeholder="输入密码"
        autocomplete="current-password"
      />

      <div v-if="error" :class="$style.formError" role="alert">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
        {{ error }}
      </div>

      <BaseButton type="submit" size="lg" block :loading="loading">登录</BaseButton>
    </form>

    <p :class="$style.switch">
      还没有账号？
      <RouterLink to="/auth/register" :class="$style.switchLink">注册</RouterLink>
    </p>
  </div>
</template>

<style module lang="scss">
.auth {
  width: 100%;
}

.head {
  margin-bottom: 2rem;
}

.title {
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 800;
  letter-spacing: -0.025em;
}

.sub {
  margin-top: 0.5rem;
  color: var(--c-steel);
}

.form {
  display: grid;
  gap: 1.25rem;
}

.formError {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--c-danger);
  border-radius: var(--r-sm);
  background: var(--c-danger-soft);
  color: var(--c-danger);
  font-size: 0.875rem;

  svg {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
  }
}

.switch {
  margin-top: 1.75rem;
  text-align: center;
  color: var(--c-steel);
  font-size: 0.9375rem;
}

.switchLink {
  color: var(--c-accent);
  font-weight: 600;
  min-height: 44px;
  padding: 0.5rem;

  &:hover {
    text-decoration: underline;
  }
}
</style>
