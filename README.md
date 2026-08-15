# Lunatic ChO 前端

化学竞赛社区 Lunatic ChO 的前端项目（ChO = 化学奥林匹克 Chemistry Olympiad，亦为碳 C · 氢 H · 氧 O）。基于 [api.md](../api.md)（API v1.1）、[plan.md](../plan.md)（方案）与 [DESIGN.md](../DESIGN.md)（设计规范）构建。

## 技术栈

- **Vue 3.4** + `<script setup lang="ts">` Composition API
- **TypeScript 5** 严格模式（`vue-tsc --noEmit` 作为构建前置检查）
- **Vite 5** + **Vue Router 4**（history 模式、路由懒加载、权限守卫）
- **Pinia** + `pinia-plugin-persistedstate`（用户态 / UI 偏好 / 点赞记录持久化）
- **Axios**（响应解包、401 会话过期处理、403/413 等错误 Toast）
- **md-editor-v3**（Markdown 编辑与预览，图片粘贴自动上传 /api/upload）
- **@vueuse/motion**（spring 入场动效）+ 自研 `v-reveal` 滚动渐入指令
- **SCSS + CSS Modules**（组件级隔离，视图级 scoped）

## 快速开始

```bash
cd frontend
npm install
npm run dev      # 开发服务器，/api 代理到 http://localhost:8787
npm run build    # vue-tsc 类型检查 + 产物构建
npm run preview  # 预览生产构建
```

### 环境变量

| 变量 | 开发（.env.development） | 生产（.env.production） |
| --- | --- | --- |
| `VITE_API_BASE` | `http://localhost:8787` | `https://lc.lisks.icu` |
| `VITE_ADMIN_OVERRIDE` | `true`（Mock 管理员） | `false` |
| `VITE_ADMIN_USER_ID` | 可选：限定 Mock 生效的用户 ID | — |

`VITE_ADMIN_OVERRIDE=true` 时（仅 DEV），登录后在 `fetchMe` 后自动将当前用户标记为管理员，便于本地调试管理端功能（发布公告）。

## 目录结构

```
frontend/src
├── api/            # Axios 实例 + 各资源 API 封装（薄封装层）
│   ├── http.ts     #   实例、拦截器（401/403/413/429/500 → Toast）
│   ├── auth.ts / me.ts / posts.ts / questions.ts / announcements.ts / upload.ts
├── stores/         # Pinia stores：user / ui / posts / questions
├── router/         # 路由表 + requiresAuth / guestOnly / requiresAdmin 守卫
├── types/          # 与 api.md 对齐的接口定义
├── directives/     # v-reveal（IntersectionObserver 渐入）
├── composables/    # useCountUp（首页统计数字滚动）+ useSpellCode（键盘彩蛋）
├── utils/          # 时间/字节/ID 等展示层格式化
├── styles/         # variables.scss（SCSS 令牌）+ global.scss（CSS 变量与全局样式）
├── components/
│   ├── atoms/      # BaseButton / BaseInput / BaseCard / AppAvatar / SkeletonBox / EmptyState
│   ├── molecules/  # PostCard / QuestionCard / ReplyItem / MarkdownEditor / MarkdownView
│   │               # FileDropZone / PaginationBar / QuestionOptionList / QuestionDetailModal
│   │               # SakuraPetals / PetalBurst
│   ├── organisms/  # AppNavbar / ToastHost / ProfileSidebar
│   └── templates/  # DefaultLayout / AuthLayout
├── views/          # 12 个页面视图（懒加载）
│   ├── Home / Posts / PostDetail / PostCreate
│   ├── Questions / QuestionCreate
│   ├── Announcements / AnnouncementCreate
│   ├── Profile（info/posts/questions/files 四个标签页）
│   ├── auth/Login / auth/Register
│   └── NotFound
├── App.vue         # RouterView + ToastHost
└── main.ts         # 入口：Pinia、路由、MotionPlugin、v-reveal、主题初始化
```

## 设计要点（DESIGN.md 落地）

- **原子化组件分层**：atoms → molecules → organisms → templates；组件样式全部 CSS Modules，页面视图 scoped。
- **令牌化**：Canvas White `#F9FAFB` / Pure Surface `#FFF` / Charcoal Ink `#18181B` / 红白 `#DC3D3D`；暗色模式由 `.dark` 下的 CSS 变量整套切换。
- **字体**：Outfit（正文/标题）+ JetBrains Mono（元信息）+ Clicker Script（品牌手写体，仅 400 字重，放大使用保证可读性），禁 Inter、禁 emoji、禁纯黑。
- **动效**：`v-motion` spring（stiffness 100 / damping 20）与 `v-reveal` 渐入交错延迟 `calc(var(--index) * 100ms)`；只动 transform/opacity，尊重 `prefers-reduced-motion`；加载态一律骨架屏（shimmer），无转圈 spinner。
- **表单**：标签置于输入框上方，聚焦 2px 强调色焦点环；按钮扁平圆角，按下 `translateY(1px) scale(0.99)`。
- **响应式**：断点 375 / 768 / 1024；<768 单列、按钮全宽、触控目标 ≥44px；首页 hero 为非居中分割式布局。

## 东方 Project 元素

在 DESIGN.md 规范框架内融入东方 Project 视觉语言（红白）：

- **红白主色**：唯一强调色由电光蓝切换为博丽灵梦红 `#dc3d3d`（暗色模式 `#e05a55`），白纸黑字 + 红白点缀即「紅白」配色。
- **阴阳玉 × 苯环标志**：站点标志为阴阳玉双鱼图，两枚圆点替换为苯环六边形——化学与东方的融合符号（`YinYangMark`，导航/页脚/登录页/空状态/favicon 共用）。
- **品牌手写体**：站名「Lunatic ChO」以 Clicker Script 手写体呈现，呼应月之都的优雅气质；旁缀片假名「ルナティック」。
- **樱花飘落**：首页 Hero 与 404 页的 `SakuraPetals` 纯装饰动画，仅 transform/opacity，`prefers-reduced-motion` 下完全停用。
- **符卡面板**：Hero 视觉面板配弹幕点阵底纹与「SPELL CARD」角标；热门帖子区标为 `SPELL CARD RANKING`；帖子详情标题上方配「SPELL CARD · 符卡」眉题。
- **难度等级**：数据看板三格分别标注东方难度 NORMAL / HARD / LUNATIC，其中仅 LUNATIC 一格以红白强调。
- **告示板与封印**：公告区标为「博丽告示板」（管理端「博丽神社 · ADMIN」），404 页为符卡「梦想封印」，题目参考答案旁配阴阳玉印章。

## 彩蛋（Easter Eggs）

- **LUNATIC 难度解锁**：在页面任意处（输入框除外）依次键入 `lunatic`，触发 toast「LUNATIC · 难度已解锁」与全屏一次性樱花祝福（`PetalBurst`，约 4 秒）。
- **阴阳玉悬停旋转**：悬停导航/页脚/登录页的品牌标志，阴阳玉旋转半周（spring 缓动）。
- **控制台问候**：打开 DevTools 可见 Clicker Script 样式的品牌欢迎语与 ChO 双关解释。
- **持久化兼容**：站点改名后 localStorage 键（`lunacho-user` / `lunacho-ui` / `lunacho-posts`）保持不变，老用户会话与点赞记录无缝保留。

## 与方案的差异说明（adaptations）

1. **设计规范冲突取舍**：plan.md 中的蓝色 `#2A7DE1`、1280px 容器、Inter 字体让位于 DESIGN.md（`#3B82F6`、1400px、Outfit）——DESIGN.md 为最终视觉标准。
2. **首页数据看板**：API 无统计端点，改用 `/api/posts`（按 likes_count 排序取 6）、`/api/questions`（limit 1）、`/api/announcements`（limit 5）的分页 `total` 派生展示。
3. **作者展示**：API 无公开用户端点（仅 `/api/me`），作者以 `user_id` 前 8 位 + 确定性哈希色头像展示。
4. **附件上传流**：帖子/回复/题目的附件随表单 `file` 字段提交（`FileDropZone mode="select"`）；`/api/upload` 用于 Markdown 图片粘贴与个人中心文件上传（`mode="upload"`）。
5. **头像字段**：PATCH /api/me 使用 `avatar` 字段（兼容后端 `avatar_url` 过渡命名）。
6. **登录 401 豁免**：登录/注册请求的 401 不触发会话过期跳转（`skipToast` + 白名单判断），由页面内联展示错误。

## API 约定

- 基础地址由 `VITE_API_BASE` 注入；所有非 `/api/auth/*` 请求自动携带 `Authorization: Bearer <token>`。
- 响应拦截器直接解包 `data` 层；分页统一为 `{ data, pagination: { page, limit, total, pages } }`。
- 上传限制：`.csv .json .parquet .pdf .png .jpg .jpeg`，单文件 ≤ 10MB（前端与后端双重校验）。
