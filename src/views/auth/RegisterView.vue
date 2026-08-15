<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { AxiosError } from 'axios'
import { useUserStore } from '@/stores/user'
import type { ApiErrorBody } from '@/types'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

const router = useRouter()
const user = useUserStore()

const form = reactive({ username: '', email: '', password: '', confirm: '' })
const error = ref('')
const loading = ref(false)
const attempted = ref(false)

const emailError = computed(() => {
  if (!attempted.value && !form.email) return ''
  if (!form.email) return '请输入邮箱'
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? '' : '邮箱格式不正确'
})

const passwordError = computed(() => {
  if (!attempted.value && !form.password) return ''
  if (!form.password) return '请输入密码'
  return form.password.length >= 6 ? '' : '密码至少 6 位'
})

const confirmError = computed(() => {
  if (!attempted.value && !form.confirm) return ''
  if (!form.confirm) return '请再次输入密码'
  return form.confirm === form.password ? '' : '两次输入的密码不一致'
})

async function submit() {
  attempted.value = true
  if (!form.username.trim() || emailError.value || passwordError.value || confirmError.value) {
    error.value = '请检查表单填写'
    return
  }
  loading.value = true
  error.value = ''
  try {
    // 注册成功后自动登录
    await user.register({
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
    })
    router.push('/')
  } catch (e) {
    const message = (e as AxiosError<ApiErrorBody>).response?.data?.error
    error.value = typeof message === 'string' ? message : '注册失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div :class="$style.auth">
    <header :class="$style.head">
      <h1 :class="$style.title">创建账号</h1>
      <p :class="$style.sub">加入化学竞赛社区，注册后自动登录</p>
    </header>

    <form :class="$style.form" novalidate @submit.prevent="submit">
      <BaseInput v-model="form.username" label="用户名" placeholder="社区内展示的名称" autocomplete="username" />
      <BaseInput v-model="form.email" label="邮箱" type="email" placeholder="you@example.com" autocomplete="email" :error="emailError || undefined" />
      <BaseInput v-model="form.password" label="密码" type="password" placeholder="至少 6 位" autocomplete="new-password" :error="passwordError || undefined" />
      <BaseInput v-model="form.confirm" label="确认密码" type="password" placeholder="再次输入密码" autocomplete="new-password" :error="confirmError || undefined" />

      <div v-if="error" :class="$style.formError" role="alert">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
        {{ error }}
      </div>

      <BaseButton type="submit" size="lg" block :loading="loading">注册</BaseButton>
    </form>

    <p :class="$style.switch">
      已有账号？
      <RouterLink to="/auth/login" :class="$style.switchLink">登录</RouterLink>
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
