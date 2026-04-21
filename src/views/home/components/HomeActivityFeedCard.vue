<script setup lang="ts">
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import DashboardIcon from '@/components/common/DashboardIcon.vue'
import type { HomeActivityItem } from '../type/interface'

defineProps<{
  activities: HomeActivityItem[]
}>()
</script>

<template>
  <section class="app-card px-[20px] py-[20px]">
    <div class="flex items-center justify-between gap-[12px]">
      <div>
        <p class="app-label">最近活動</p>
        <p class="app-card-title mt-[8px]">通知、積分與兌換摘要</p>
        <p class="app-card-caption mt-[8px]">
          重要更新集中在這裡，不用先往下滑才看得到入口。
        </p>
      </div>

      <div
        class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-accent-soft)] text-[color:var(--app-accent-strong)]"
      >
        <DashboardIcon name="activity" :size="18" />
      </div>
    </div>

    <div class="mt-[20px] space-y-[12px]">
      <article
        v-for="activity in activities"
        :key="activity.id"
        class="flex flex-wrap items-start justify-between gap-[0.875rem] rounded-[1.25rem] border border-[rgba(191,206,228,0.64)] bg-[rgba(249,251,255,0.92)] px-4 py-[0.95rem]"
      >
        <span
          class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--app-accent-soft)] text-[color:var(--app-accent-strong)]"
        >
          <DashboardIcon :name="activity.icon" :size="18" />
        </span>

        <div class="min-w-0 flex-1">
          <p class="app-text-strong text-[15px] font-semibold">
            {{ activity.label }}
          </p>
          <p class="app-text-muted mt-[6px] text-[13px] leading-[20px]">
            {{ activity.description }}
          </p>
        </div>

        <time
          class="mt-[-0.25rem] w-full pl-[3.125rem] text-left text-[0.75rem] leading-5 text-[color:var(--app-text-soft)]"
        >
          {{ activity.timestampLabel }}
        </time>
      </article>

      <AppEmptyState
        v-if="!activities.length"
        title="還沒有最近活動"
        description="任務、加分與兌換會出現在這裡。"
      />
    </div>
  </section>
</template>
