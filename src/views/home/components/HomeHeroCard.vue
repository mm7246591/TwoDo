<script setup lang="ts">
import DashboardIcon from "@/components/common/DashboardIcon.vue";
import type { HomeHeroStatItem } from "../type/interface";

defineProps<{
  message: string;
  stats: HomeHeroStatItem[];
}>();
</script>

<template>
  <section class="app-hero-card app-card-section relative overflow-hidden">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="app-hero-title max-w-[16ch]">
          {{ message }}
        </p>
      </div>

      <div
        class="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/70 text-[color:var(--app-accent-strong)] shadow-[0_16px_36px_rgba(13,106,223,0.14)]"
      >
        <DashboardIcon name="heart-link" :size="28" />
      </div>
    </div>

    <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <article
        v-for="stat in stats"
        :key="stat.label"
        class="app-hero-stat border border-white/65 bg-white/70 p-4 backdrop-blur-[12px] rounded-[1.4rem]"
      >
        <div
          class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-accent-soft)] text-[color:var(--app-accent-strong)]"
        >
          <DashboardIcon :name="stat.icon" :size="18" />
        </div>
        <p class="app-label mt-3">{{ stat.label }}</p>
        <p class="app-metric-value mt-2">{{ stat.value }}</p>
      </article>
    </div>
  </section>
</template>
