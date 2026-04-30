<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { setNextDockRouteTransition } from "@/composables/useRouteTransition";

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
    label: "獎勵",
    routeName: "reward",
  },
]);

const getIsActive = (item: DockItem) =>
  item.activeRouteNames?.includes(String(route.name)) ??
  route.name === item.routeName;

/**
 * 導向底部導覽頁面，並在切換前指定底部導覽專用轉場。
 *
 * @param routeName - 目標底部導覽路由名稱。
 */
const navigate = async (routeName: DockRouteName) => {
  if (route.name === routeName) {
    return;
  }

  setNextDockRouteTransition();
  await router.push({ name: routeName });
};
</script>

<template>
  <nav
    class="sticky bottom-[0px] z-[20] mx-auto mt-auto grid min-h-[84px] w-full grid-cols-4 rounded-t-[28px] border-t border-[rgba(255,255,255,0.86)] bg-white pb-[max(10px,calc(env(safe-area-inset-bottom,0px)_+_8px))] pt-[10px] shadow-[0_-18px_42px_rgba(118,69,52,0.12)] backdrop-blur-[18px]"
    aria-label="主要導覽">
    <button v-for="item in dockItems" :key="item.key" :class="[
      'relative grid min-h-[72px] min-w-[0px] content-center justify-items-center gap-[3px] border-[0px] bg-transparent px-[2px] pb-[8px] pt-[7px] text-[12px] font-[700] leading-[1.2] transition-colors duration-[180ms] ease-in-out focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_rgba(255,158,133,0.28)]',
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

<spec lang="md">
## 1. 說明

- 顯示主要底部導覽列，讓使用者在首頁、任務、配對與獎勵頁之間切換。

## 2. 功能需求

- 1. 使用者點擊未啟用的底部 icon 時，導向對應主要頁面。
- 2. 使用者點擊目前頁面的底部 icon 時，不重複導頁。
- 3. 底部 icon 導頁前，標記下一次路由切換使用淡入淡出並由下往上的轉場。
- 4. 目前頁面對應的 icon 顯示啟用狀態與 aria-current。

## 3. 對接口

- props：無。
- emit：無。
- defineModel：無。
</spec>
