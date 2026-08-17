import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { MotionPlugin } from '@vueuse/motion'
import App from './App.vue'
import router from './router'
import reveal from './directives/reveal'
import { useUserStore } from './stores/user'
import { useUiStore } from './stores/ui'
import './styles/global.scss'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(MotionPlugin)
app.directive('reveal', reveal)

// 应用持久化主题（避免首帧闪烁）
useUiStore(pinia).applyTheme()

// 刷新恢复会话：token 存在则补齐完整资料
const userStore = useUserStore(pinia)
if (userStore.token) {
  userStore.fetchMe().catch(() => {
    // 拦截器已处理 401 跳转
  })
}

// 彩蛋：控制台问候（ChO 双关：化学奥林匹克 · 碳氢氧）
console.log(
  '%cLunatic ChO%c  化竞幻想乡\nChO = Chemistry Olympiad · C·H·O 碳氢氧\n在页面任意处键入 "lunatic" 解锁 LUNATIC 难度',
  'font-family:"Clicker Script",cursive;font-size:30px;line-height:1.4;color:#dc3d3d;',
  'font-family:Outfit,sans-serif;font-size:12px;line-height:1.4;color:#71717a;'
)

app.mount('#app')
