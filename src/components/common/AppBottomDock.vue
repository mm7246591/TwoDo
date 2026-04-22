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
    label: "待辦",
    routeName: "tasks",
  },
  {
    icon: "gift",
    label: "獎勵",
    routeName: "rewards",
  },
  {
    icon: "points",
    label: "點數",
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
    class="app-bottom-dock"
    aria-label="主要功能入口"
  >
    <button
      v-for="item in dockItems"
      :key="item.routeName"
      :class="[
        'app-bottom-dock__item',
        getIsActive(item.routeName) ? 'is-active' : '',
      ]"
      type="button"
      :aria-label="`前往${item.label}`"
      :aria-current="getIsActive(item.routeName) ? 'page' : undefined"
      @click="navigate(item.routeName)"
    >
      <span
        class="app-bottom-dock__icon"
      >
        <DashboardIcon :name="item.icon" :size="19" />
        <span
          v-if="getBadge(item.routeName)"
          class="app-bottom-dock__badge"
        >
          {{ getBadge(item.routeName) }}
        </span>
      </span>
      <span class="app-bottom-dock__label">{{ item.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.app-bottom-dock {
  position: sticky;
  bottom: max(0.75rem, calc(var(--safe-bottom) + 0.25rem));
  z-index: 20;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  width: calc(100% - 1.5rem);
  min-height: 4.5rem;
  margin: auto auto max(0.75rem, calc(var(--safe-bottom) + 0.25rem));
  border: 1px solid rgba(255, 255, 255, 0.86);
  border-radius: 1.6rem;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 16px 38px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(18px);
}

.app-bottom-dock__item {
  position: relative;
  display: grid;
  min-width: 0;
  min-height: 4.5rem;
  align-content: center;
  justify-items: center;
  gap: 0.2rem;
  border: 0;
  background: transparent;
  padding: 0.45rem 0.15rem 0.5rem;
  color: var(--app-text-soft);
  font-size: var(--app-type-12);
  font-weight: 700;
  line-height: 1.2;
}

.app-bottom-dock__item:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2px rgba(29, 143, 242, 0.24);
}

.app-bottom-dock__item.is-active {
  color: var(--app-accent-strong);
}

.app-bottom-dock__icon {
  position: relative;
  display: inline-flex;
  width: 3rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: currentColor;
  transition:
    background-color 180ms ease,
    color 180ms ease,
    transform 180ms ease;
}

.app-bottom-dock__item.is-active .app-bottom-dock__icon {
  background: var(--app-accent-soft);
  transform: translateY(-1px);
}

.app-bottom-dock__label {
  max-width: 100%;
  overflow: hidden;
  color: currentColor;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-bottom-dock__badge {
  position: absolute;
  top: -0.2rem;
  right: 0.12rem;
  min-width: 1rem;
  height: 1rem;
  border-radius: 999px;
  background: var(--app-danger);
  padding-inline: 0.25rem;
  color: #ffffff;
  font-size: var(--app-type-12);
  font-weight: 800;
  line-height: 1rem;
  text-align: center;
}

@media (min-width: 640px) {
  .app-bottom-dock {
    width: calc(100% - 2rem);
  }
}
</style>
