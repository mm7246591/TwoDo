<script setup lang="ts">
import AppEmptyState from "@/components/common/AppEmptyState.vue";
import DashboardIcon from "@/components/common/DashboardIcon.vue";
import type {
  HomeDashboardRouteName,
  HomePanelAction,
  HomePanelMetric,
  HomeTaskItem,
} from "../type/interface";

defineProps<{
  action?: HomePanelAction;
  icon: HomePanelAction["icon"];
  items: HomeTaskItem[];
  metrics?: HomePanelMetric[];
  title: string;
}>();

const emit = defineEmits<{
  navigate: [routeName: HomeDashboardRouteName];
}>();

const badgeClassMap: Record<HomeTaskItem["badgeTone"], string> = {
  accent: "bg-[rgba(29,143,242,0.1)] text-[color:var(--app-accent-strong)]",
  success: "bg-[rgba(20,184,166,0.12)] text-[var(--color-support-700)]",
};
</script>

<template>
  <section class="app-card app-card-section">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="app-card-title">{{ title }}</p>
      </div>

      <div
        class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-accent-soft)] text-[color:var(--app-accent-strong)]"
      >
        <DashboardIcon :name="icon" :size="18" />
      </div>
    </div>

    <div class="app-card-list-compact mt-5">
      <article
        v-for="item in items"
        :key="item.id"
        class="flex flex-wrap items-start justify-between gap-3 rounded-[1.25rem] border border-[rgba(191,206,228,0.64)] bg-[rgba(249,251,255,0.92)] p-4"
      >
        <div class="min-w-0">
          <p class="app-list-title truncate">
            {{ item.title }}
          </p>
          <p class="app-list-body mt-2">
            {{ item.description }}
          </p>
        </div>

        <div
          :class="[
            'app-badge-text shrink-0 whitespace-nowrap rounded-full px-3 py-2',
            badgeClassMap[item.badgeTone],
          ]"
        >
          {{ item.badge }}
        </div>
      </article>

      <AppEmptyState v-if="!items.length" />
    </div>

    <div v-if="metrics?.length" class="mt-5 grid grid-cols-2 gap-3">
      <article
        v-for="metric in metrics"
        :key="metric.label"
        class="rounded-[1.4rem] border border-white/65 bg-white/70 p-4 backdrop-blur-[12px]"
      >
        <p class="app-label">{{ metric.label }}</p>
        <p class="app-card-title mt-2">{{ metric.value }}</p>
      </article>
    </div>

    <button
      v-if="action"
      class="app-secondary-button mt-5 w-full"
      type="button"
      @click="emit('navigate', action.routeName)"
    >
      <span class="inline-flex items-center justify-center gap-2">
        <DashboardIcon :name="action.icon" :size="18" />
        {{ action.label }}
      </span>
    </button>
  </section>
</template>
