<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import DashboardIcon from "@/components/common/DashboardIcon.vue";
import { useCoupleStore } from "@/pinia/couple";

type DockRouteName =
  | "home"
  | "pairing"
  | "points"
  | "rewards"
  | "settings"
  | "tasks";

type DockIconName =
  | "gift"
  | "home"
  | "points"
  | "settings"
  | "tasks";

type DockItem = {
  icon: DockIconName;
  label: string;
  routeName: DockRouteName;
};

const route = useRoute();
const router = useRouter();
const coupleStore = useCoupleStore();

const dockItems = computed<DockItem[]>(() => [
  {
    icon: "home",
    label: "首頁",
    routeName: "home",
  },
  {
    icon: "tasks",
    label: "任務",
    routeName: "tasks",
  },
  {
    icon: "gift",
    label: "獎勵",
    routeName: "rewards",
  },
  {
    icon: "points",
    label: "積分",
    routeName: "points",
  },
  {
    icon: "settings",
    label: coupleStore.getIsPaired ? "設定" : "配對",
    routeName: coupleStore.getIsPaired ? "settings" : "pairing",
  },
]);

const getIsActive = (routeName: DockRouteName) => route.name === routeName;

const getBadge = (routeName: DockRouteName) => {
  if (routeName === "pairing" && !coupleStore.getIsPaired) {
    return "!";
  }

  return "";
};

const navigate = async (routeName: DockRouteName) => {
  if (route.name === routeName) {
    return;
  }

  await router.push({ name: routeName });
};
</script>

<template>
  <nav
    class="fixed bottom-[max(0.85rem,calc(var(--safe-bottom)+0.4rem))] left-1/2 z-20 flex w-[min(calc(100vw-40px),24.5rem)] -translate-x-1/2 rounded-[1.8rem] border border-white/90 bg-white/88 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-[18px] sm:w-[min(calc(100vw-56px),24.5rem)]"
    aria-label="主要功能入口"
  >
    <button
      v-for="item in dockItems"
      :key="item.routeName"
      :class="[
        'relative grid min-w-0 flex-1 justify-items-center gap-[0.35rem] border-0 bg-transparent px-[0.2rem] py-[0.82rem] text-[0.65rem] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(29,143,242,0.28)] focus-visible:ring-inset sm:px-[0.4rem] sm:text-[0.72rem]',
        getIsActive(item.routeName)
          ? 'text-[color:var(--app-text-strong)]'
          : 'text-[color:var(--app-text-soft)]',
      ]"
      type="button"
      :aria-label="`前往${item.label}`"
      @click="navigate(item.routeName)"
    >
      <span
        :class="[
          'relative inline-flex h-[2.3rem] w-[2.3rem] items-center justify-center rounded-full transition-colors',
          getIsActive(item.routeName)
            ? 'bg-[rgba(29,143,242,0.14)] text-[color:var(--app-accent-strong)]'
            : 'bg-[rgba(29,143,242,0.08)] text-[color:var(--app-accent-strong)]',
        ]"
      >
        <DashboardIcon :name="item.icon" :size="19" />
        <span
          v-if="getBadge(item.routeName)"
          class="absolute right-[-0.2rem] top-[-0.15rem] h-[1.1rem] min-w-[1.1rem] rounded-full bg-[var(--app-danger)] px-1 text-center text-[0.625rem] leading-[1.1rem] text-white"
        >
          {{ getBadge(item.routeName) }}
        </span>
      </span>
      <span class="truncate">{{ item.label }}</span>
    </button>
  </nav>
</template>
