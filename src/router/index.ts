import { createRouter, createWebHistory } from "vue-router";
import { pinia } from "@/pinia";
import { useAuthStore } from "@/pinia/auth";
import { useUserStore } from "@/pinia/user";
import { resolvePostAuthRouteName } from "@/services/authNavigation";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/views/home/HomeView.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/user/LoginView.vue"),
      meta: {
        requiresGuest: true,
      },
    },
    {
      path: "/register",
      name: "register",
      component: () => import("@/views/user/RegisterView.vue"),
      meta: {
        requiresGuest: true,
      },
    },
    {
      path: "/verify-email",
      name: "verify-email",
      component: () => import("@/views/user/VerifyEmailView.vue"),
      meta: {
        allowsUnverifiedEmail: true,
        requiresAuth: true,
      },
    },
    {
      path: "/email-action",
      name: "email-action",
      component: () => import("@/views/user/EmailActionView.vue"),
      meta: {
        allowsUnverifiedEmail: true,
      },
    },
    {
      path: "/pairing",
      name: "pairing",
      component: () => import("@/views/pairing/PairingView.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/task-list",
      name: "task-list",
      component: () => import("@/views/task/TaskList.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/task/create-task",
      name: "create-task",
      component: () => import("@/views/task/CreateTask.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/point",
      name: "point",
      component: () => import("@/views/point/PointView.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/reward",
      name: "reward",
      component: () => import("@/views/reward/RewardView.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/notifications",
      name: "notification",
      component: () => import("@/views/notification/NotificationView.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/setting",
      name: "setting",
      component: () => import("@/views/setting/SettingView.vue"),
      meta: {
        requiresAuth: true,
      },
    },
  ],
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore(pinia);
  const userStore = useUserStore(pinia);

  await authStore.init();

  if (to.meta.requiresAuth && !authStore.getIsLoggedIn) {
    return { name: "login" };
  }

  if (
    authStore.getRequiresEmailVerification &&
    !to.meta.allowsUnverifiedEmail
  ) {
    return { name: "verify-email" };
  }

  if (
    to.name === "verify-email" &&
    authStore.getIsLoggedIn &&
    !authStore.getRequiresEmailVerification
  ) {
    return {
      name: await resolvePostAuthRouteName(
        authStore.getUserUid,
        userStore.profile,
      ),
    };
  }

  if (to.meta.requiresGuest && authStore.getIsLoggedIn) {
    return {
      name: await resolvePostAuthRouteName(
        authStore.getUserUid,
        userStore.profile,
      ),
    };
  }
});

export default router;
