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
    <div class="flex items-start justify-between gap-[16px]">
      <div>
        <p class="app-hero-title max-w-[16ch]">
          {{ message }}
        </p>
      </div>

      <div
        class="inline-flex h-[56px] w-[56px] items-center justify-center rounded-full bg-white/70 text-[color:var(--app-accent-strong)] shadow-[0_16px_36px_rgba(13,106,223,0.14)]"
      >
        <DashboardIcon name="heart-link" :size="28" />
      </div>
    </div>

    <div class="mt-[20px] grid grid-cols-2 gap-[12px] sm:grid-cols-4">
      <article
        v-for="stat in stats"
        :key="stat.label"
        class="app-hero-stat border border-white/65 bg-white/70 p-[16px] backdrop-blur-[12px] rounded-[1.4rem]"
      >
        <div
          class="inline-flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[var(--app-accent-soft)] text-[color:var(--app-accent-strong)]"
        >
          <DashboardIcon :name="stat.icon" :size="18" />
        </div>
        <p class="app-label mt-[12px]">{{ stat.label }}</p>
        <p class="app-metric-value mt-[8px]">{{ stat.value }}</p>
      </article>
    </div>
  </section>
</template>
