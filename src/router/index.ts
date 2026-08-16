import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import DefaultLayout from '@/components/templates/DefaultLayout.vue'
import AuthLayout from '@/components/templates/AuthLayout.vue'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresAdmin?: boolean
    guestOnly?: boolean
    title?: string
  }
}

// 路由懒加载（defineAsyncComponent 由 Vite 动态 import 承担）
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 }
  },
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      children: [
        { path: '', name: 'home', component: () => import('@/views/HomeView.vue'), meta: { title: '首页' } },
        { path: 'posts', name: 'posts', component: () => import('@/views/PostsView.vue'), meta: { title: '帖子' } },
        {
          path: 'posts/create',
          name: 'post-create',
          component: () => import('@/views/PostCreateView.vue'),
          meta: { requiresAuth: true, title: '发布帖子' },
        },
        { path: 'posts/:id', name: 'post-detail', component: () => import('@/views/PostDetailView.vue'), meta: { title: '帖子详情' } },
        { path: 'questions', name: 'questions', component: () => import('@/views/QuestionsView.vue'), meta: { title: '题库' } },
        {
          path: 'questions/create',
          name: 'question-create',
          component: () => import('@/views/QuestionCreateView.vue'),
          meta: { requiresAuth: true, requiresAdmin: true, title: '创建题目' },
        },
        { path: 'announcements', name: 'announcements', component: () => import('@/views/AnnouncementsView.vue'), meta: { title: '公告' } },
        {
          path: 'admin/announcement/create',
          name: 'announcement-create',
          component: () => import('@/views/AnnouncementCreateView.vue'),
          meta: { requiresAuth: true, requiresAdmin: true, title: '发布公告' },
        },
        {
          path: 'admin/grade',
          name: 'admin-grade',
          component: () => import('@/views/AdminGradeView.vue'),
          meta: { requiresAuth: true, requiresAdmin: true, title: '批改工作台' },
        },
        {
          path: 'admin/statistics',
          name: 'admin-statistics',
          component: () => import('@/views/AdminStatisticsView.vue'),
          meta: { requiresAuth: true, requiresAdmin: true, title: '统计看板' },
        },
        { path: 'profile', name: 'profile', component: () => import('@/views/ProfileView.vue'), meta: { requiresAuth: true, title: '个人中心' } },
      ],
    },
    {
      path: '/auth',
      component: AuthLayout,
      children: [
        { path: 'login', name: 'login', component: () => import('@/views/auth/LoginView.vue'), meta: { guestOnly: true, title: '登录' } },
        { path: 'register', name: 'register', component: () => import('@/views/auth/RegisterView.vue'), meta: { guestOnly: true, title: '注册' } },
      ],
    },
    {
      path: '/404',
      component: DefaultLayout,
      children: [{ path: '', name: 'not-found', component: () => import('@/views/NotFoundView.vue'), meta: { title: '页面不存在' } }],
    },
    { path: '/:pathMatch(.*)*', redirect: '/404' },
  ],
})

// 权限守卫
router.beforeEach((to) => {
  const user = useUserStore()
  if (to.meta.requiresAuth && !user.isLoggedIn) {
    return { path: '/auth/login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guestOnly && user.isLoggedIn) return { path: '/' }
  // 管理员专区：非管理员重定向 404
  if (to.meta.requiresAdmin && !user.isAdmin) return { path: '/404' }
  return true
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · Lunatic ChO` : 'Lunatic ChO · 化学竞赛社区'
})

export default router
