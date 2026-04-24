<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

type DockRouteName = "home" | "rewards" | "tasks";

type DockIconName = "add_circle" | "check_circle" | "home" | "storefront";

type DockItem = {
  activeRouteName?: DockRouteName;
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
    routeName: "tasks",
  },
  {
    icon: "add_circle",
    key: "create",
    label: "建立",
    routeName: "tasks",
  },
  {
    icon: "storefront",
    key: "shop",
    label: "商店",
    routeName: "rewards",
  },
]);

const getIsActive = (item: DockItem) =>
  route.name === (item.activeRouteName ?? item.routeName) &&
  item.key !== "create";

const navigate = async (routeName: DockRouteName) => {
  if (route.name === routeName) {
    return;
  }

  await router.push({ name: routeName });
};
</script>

<template>
  <nav
    class="sticky bottom-[max(12px,calc(var(--safe-bottom)_+_4px))] z-[20] mx-auto mb-[max(12px,calc(var(--safe-bottom)_+_4px))] mt-auto grid min-h-[72px] w-[calc(100%_-_24px)] grid-cols-4 rounded-[26px] border border-[rgba(255,255,255,0.86)] bg-white/90 shadow-[0_16px_38px_rgba(15,23,42,0.12)] backdrop-blur-[18px] sm:w-[calc(100%_-_32px)]"
    aria-label="主要功能入口"
  >
    <button
      v-for="item in dockItems"
      :key="item.key"
      :class="[
        'relative grid min-h-[72px] min-w-[0px] content-center justify-items-center gap-[3px] border-[0px] bg-transparent px-[2px] pb-[8px] pt-[7px] text-[length:var(--app-type-12)] font-[700] leading-[1.2] transition-colors duration-[180ms] ease-in-out focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_rgba(255,158,133,0.28)]',
        getIsActive(item)
          ? 'text-[var(--app-coral)]'
          : 'text-[var(--app-text-soft)] hover:text-[var(--app-coral)]',
      ]"
      type="button"
      :aria-label="`前往${item.label}`"
      :aria-current="getIsActive(item) ? 'page' : undefined"
      @click="navigate(item.routeName)"
    >
      <span
        :class="[
          'relative inline-flex h-[40px] w-[56px] items-center justify-center rounded-[20px] transition-[background-color,color,transform] duration-[180ms] ease-in-out',
          getIsActive(item)
            ? 'bg-[rgba(255,158,133,0.12)] text-[var(--app-coral)]'
            : 'text-current',
        ]"
      >
        <span
          class="material-symbols-outlined fill text-[26px]"
          aria-hidden="true"
        >
          {{ item.icon }}
        </span>
      </span>
      <span
        class="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-current"
      >
        {{ item.label }}
      </span>
    </button>
  </nav>
</template>
