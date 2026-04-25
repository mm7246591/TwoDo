<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

type DockRouteName = "home" | "pairing" | "reward" | "task-list";

type DockIconName = "check_circle" | "favorite" | "home" | "storefront";

type DockItem = {
  activeRouteNames?: string[];
  icon: DockIconName;
  key: string;
  label: string;
  routeName: DockRouteName;
};

const route = useRoute();
const router = useRouter();

const dockItems = computed<DockItem[]>(() => [
  {
    icon: "home",
    key: "home",
    label: "首頁",
    routeName: "home",
  },
  {
    icon: "check_circle",
    key: "tasks",
    label: "任務",
    activeRouteNames: ["task-list", "create-task"],
    routeName: "task-list",
  },
  {
    icon: "favorite",
    key: "pairing",
    label: "配對",
    routeName: "pairing",
  },
  {
    icon: "storefront",
    key: "shop",
    label: "商店",
    routeName: "reward",
  },
]);

const getIsActive = (item: DockItem) =>
  item.activeRouteNames?.includes(String(route.name)) ??
  route.name === item.routeName;

const navigate = async (routeName: DockRouteName) => {
  if (route.name === routeName) {
    return;
  }

  await router.push({ name: routeName });
};
</script>

<template>
  <nav
    class="sticky bottom-0 z-[20] mx-auto mt-auto grid min-h-[84px] w-full grid-cols-4 rounded-t-[28px] border-t border-[rgba(255,255,255,0.86)] bg-white pb-[max(10px,calc(var(--safe-bottom)_+_8px))] pt-[10px] shadow-[0_-18px_42px_rgba(118,69,52,0.12)] backdrop-blur-[18px]"
    aria-label="主要導覽">
    <button v-for="item in dockItems" :key="item.key" :class="[
      'relative grid min-h-[72px] min-w-[0px] content-center justify-items-center gap-[3px] border-[0px] bg-transparent px-[2px] pb-[8px] pt-[7px] text-[length:var(--app-type-12)] font-[700] leading-[1.2] transition-colors duration-[180ms] ease-in-out focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_rgba(255,158,133,0.28)]',
      getIsActive(item)
        ? 'text-[var(--app-coral)]'
        : 'text-[var(--app-text-soft)] hover:text-[var(--app-coral)]',
    ]" type="button" :aria-label="`前往${item.label}`" :aria-current="getIsActive(item) ? 'page' : undefined"
      @click="navigate(item.routeName)">
      <span :class="[
        'relative inline-flex h-[40px] w-[56px] items-center justify-center rounded-[18px] transition-[background-color,color,transform] duration-[180ms] ease-in-out',
        getIsActive(item)
          ? 'bg-[rgba(255,158,133,0.12)] text-[var(--app-coral)]'
          : 'text-current',
      ]">
        <span class="material-symbols-outlined fill text-[26px]" aria-hidden="true">
          {{ item.icon }}
        </span>
      </span>
      <span class="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-current">
        {{ item.label }}
      </span>
    </button>
  </nav>
</template>
