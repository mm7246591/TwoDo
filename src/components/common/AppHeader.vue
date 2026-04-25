<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useNotificationsStore } from "@/pinia/notifications";
import { useUserStore } from "@/pinia/user";

const route = useRoute();
const router = useRouter();
const notificationsStore = useNotificationsStore();
const userStore = useUserStore();

const userName = computed(() => userStore.profile?.displayName || "TwoDo User");
const photoUrl = computed(() => userStore.profile?.photoURL);
const unreadCount = computed(() => notificationsStore.getUnreadCount);

const getInitial = (value: string) =>
  value.trim().slice(0, 1).toUpperCase() || "T";

const handleNotifications = async () => {
  if (route.name === "notification") {
    return;
  }

  await router.push({ name: "notification" });
};

watch(
  () => ({
    coupleId: userStore.profile?.coupleId ?? "",
    uid: userStore.profile?.uid ?? "",
  }),
  ({ coupleId, uid }) => {
    if (!coupleId || !uid) {
      notificationsStore.reset();
      return;
    }

    void notificationsStore.syncNotifications(uid, coupleId);
  },
  { immediate: true },
);
</script>

<template>
  <header
    class="sticky top-[0px] z-[30] flex items-center justify-between gap-[var(--app-space-16)] border-b border-[rgba(255,255,255,0.68)] bg-[rgba(255,253,251,0.82)] px-[var(--app-space-20)] py-[var(--app-space-12)] shadow-[0_14px_34px_rgba(148,72,53,0.08)] backdrop-blur-[18px] sm:px-[var(--app-space-28)]"
  >
    <div class="inline-flex min-w-[0px] items-center gap-[var(--app-space-12)]">
      <span
        class="inline-flex h-[40px] w-[40px] flex-none items-center justify-center overflow-hidden rounded-full bg-[var(--app-coral)] text-[length:var(--app-type-15)] font-[800] text-white"
        aria-hidden="true"
      >
        <img
          v-if="photoUrl"
          class="h-full w-full object-cover"
          :src="photoUrl"
          :alt="`${userName} avatar`"
        />
        <span v-else>{{ getInitial(userName) }}</span>
      </span>
      <span
        class="overflow-hidden text-ellipsis whitespace-nowrap text-[length:var(--app-type-24)] font-[900] leading-none tracking-[0px] text-[var(--app-coral)]"
      >
        TwoDo
      </span>
    </div>

    <button
      class="relative inline-flex h-[40px] min-h-[40px] w-[40px] min-w-[40px] flex-none items-center justify-center rounded-full border border-[rgba(255,255,255,0.74)] bg-[var(--app-surface-muted)] text-[var(--app-coral)] transition-[background-color,transform] duration-[180ms] ease-in-out hover:-translate-y-[1px] focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--app-input-focus-ring)]"
      type="button"
      aria-label="Open notifications"
      @click="handleNotifications"
    >
      <span class="material-symbols-outlined text-[24px]" aria-hidden="true">
        notifications
      </span>
      <span
        v-if="unreadCount"
        class="absolute right-[-2px] top-[-2px] h-[16px] min-w-[16px] rounded-full bg-[var(--app-danger)] px-[4px] text-center text-[10px] font-[800] leading-[16px] text-white"
      >
        {{ unreadCount }}
      </span>
    </button>
  </header>
</template>
