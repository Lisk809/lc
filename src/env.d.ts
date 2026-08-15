/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_API_BASE: string
  readonly VITE_ADMIN_OVERRIDE: string
  readonly VITE_ADMIN_USER_ID?: string
  readonly VITE_TURNSTILE_SITE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
