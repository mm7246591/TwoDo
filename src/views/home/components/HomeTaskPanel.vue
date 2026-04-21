<script setup lang="ts">
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import DashboardIcon from '@/components/common/DashboardIcon.vue'
import type {
  HomeDashboardRouteName,
  HomeEmptyStateContent,
  HomePanelAction,
  HomePanelMetric,
  HomeTaskItem,
} from '../type/interface'

defineProps<{
  action?: HomePanelAction
  caption: string
  emptyState: HomeEmptyStateContent
  eyebrow: string
  icon: HomePanelAction['icon']
  items: HomeTaskItem[]
  metrics?: HomePanelMetric[]
  title: string
}>()

const emit = defineEmits<{
  navigate: [routeName: HomeDashboardRouteName]
}>()

const badgeClassMap: Record<HomeTaskItem['badgeTone'], string> = {
  accent:
    'bg-[rgba(29,143,242,0.1)] text-[color:var(--app-accent-strong)]',
  success:
    'bg-[rgba(20,184,166,0.12)] text-[var(--color-support-700)]',
}
</script>

<template>
  <section class="app-card px-[20px] py-[20px]">
    <div class="flex items-center justify-between gap-[12px]">
      <div>
        <p class="app-label">{{ eyebrow }}</p>
        <p class="app-card-title mt-[8px]">{{ title }}</p>
        <p class="app-card-caption mt-[8px]">
          {{ caption }}
        </p>
      </div>

      <div
        class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-accent-soft)] text-[color:var(--app-accent-strong)]"
      >
        <DashboardIcon :name="icon" :size="18" />
      </div>
    </div>

    <div class="mt-[20px] space-y-[12px]">
      <article
        v-for="item in items"
        :key="item.id"
        class="flex flex-wrap items-start justify-between gap-[0.875rem] rounded-[1.25rem] border border-[rgba(191,206,228,0.64)] bg-[rgba(249,251,255,0.92)] px-4 py-[0.95rem]"
      >
        <div class="min-w-0">
          <p class="app-text-strong truncate text-[16px] font-semibold">
            {{ item.title }}
          </p>
          <p class="app-text-muted mt-[6px] text-[13px] leading-[20px]">
            {{ item.description }}
          </p>
        </div>

        <div
          :class="[
            'shrink-0 whitespace-nowrap rounded-full px-3 py-[0.45rem] text-[0.75rem] font-bold tracking-[0.06em]',
            badgeClassMap[item.badgeTone],
          ]"
        >
          {{ item.badge }}
        </div>
      </article>

      <AppEmptyState
        v-if="!items.length"
        :title="emptyState.title"
        :description="emptyState.description"
      />
    </div>

    <div v-if="metrics?.length" class="mt-[20px] grid grid-cols-2 gap-[12px]">
      <article
        v-for="metric in metrics"
        :key="metric.label"
        class="rounded-[1.4rem] border border-white/65 bg-white/70 px-[16px] py-[16px] backdrop-blur-[12px]"
      >
        <p class="app-label">{{ metric.label }}</p>
        <p class="app-card-title mt-[8px]">{{ metric.value }}</p>
      </article>
    </div>

    <button
      v-if="action"
      class="app-secondary-button mt-[20px] w-full"
      type="button"
      @click="emit('navigate', action.routeName)"
    >
      <span class="inline-flex items-center justify-center gap-[10px]">
        <DashboardIcon :name="action.icon" :size="18" />
        {{ action.label }}
      </span>
    </button>
  </section>
</template>
