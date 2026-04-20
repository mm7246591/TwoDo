import { createRouter, createWebHistory } from 'vue-router'
import { pinia } from '@/pinia'
import { useAuthStore } from '@/pinia/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/user/LoginView.vue'),
      meta: {
        requiresGuest: true,
      },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/user/RegisterView.vue'),
      meta: {
        requiresGuest: true,
      },
    },
    {
      path: '/pairing',
      name: 'pairing',
      component: () => import('@/views/PairingView.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: () => import('@/views/tasks/TasksView.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/points',
      name: 'points',
      component: () => import('@/views/points/PointsView.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/rewards',
      name: 'rewards',
      component: () => import('@/views/rewards/RewardsView.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('@/views/notifications/NotificationsView.vue'),
      meta: {
        requiresAuth: true,
      },
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore(pinia)

  await authStore.init()

  if (to.meta.requiresAuth && !authStore.getIsLoggedIn) {
    return { name: 'login' }
  }

  if (to.meta.requiresGuest && authStore.getIsLoggedIn) {
    return { name: 'home' }
  }
})

export default router
