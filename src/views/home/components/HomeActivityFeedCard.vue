<script setup lang="ts">
import AppEmptyState from "@/components/common/AppEmptyState.vue";
import DashboardIcon from "@/components/common/DashboardIcon.vue";
import type { HomeActivityItem } from "../type/interface";

defineProps<{
  activities: HomeActivityItem[];
}>();
</script>

<template>
  <section class="app-card app-card-section">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="app-card-title">最近更新</p>
      </div>

      <div
        class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-accent-soft)] text-[color:var(--app-accent-strong)]"
      >
        <DashboardIcon name="activity" :size="18" />
      </div>
    </div>

    <div class="app-card-list-compact mt-5">
      <article
        v-for="activity in activities"
        :key="activity.id"
        class="flex flex-wrap items-start justify-between gap-3 rounded-[1.25rem] border border-[rgba(191,206,228,0.64)] bg-[rgba(249,251,255,0.92)] p-4"
      >
        <span
          class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--app-accent-soft)] text-[color:var(--app-accent-strong)]"
        >
          <DashboardIcon :name="activity.icon" :size="18" />
        </span>

        <div class="min-w-0 flex-1">
          <p class="app-list-title">
            {{ activity.label }}
          </p>
          <p class="app-list-body mt-2">
            {{ activity.description }}
          </p>
        </div>

        <time
          class="app-meta-caption mt-[-0.25rem] w-full pl-[3.125rem] text-left"
        >
          {{ activity.timestampLabel }}
        </time>
      </article>

      <AppEmptyState
        v-if="!activities.length"
        title="還沒有更新"
        description="待辦、點數與兌換會顯示在清單中。"
      />
    </div>
  </section>
</template>
