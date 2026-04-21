<script setup lang="ts">
import DashboardIcon from '@/components/common/DashboardIcon.vue'
import type { HomeHeroStatItem } from '../type/interface'

defineProps<{
  description: string
  stats: HomeHeroStatItem[]
  title: string
}>()
</script>

<template>
  <section class="app-hero-card relative overflow-hidden p-[20px]">
    <div class="flex items-start justify-between gap-[16px]">
      <div>
        <p class="app-hero-kicker">今天狀態</p>
        <p
          class="app-text-strong mt-[12px] max-w-[12ch] text-[28px] font-semibold leading-[1.12] tracking-[-0.04em]"
        >
          {{ title }}
        </p>
        <p class="app-hero-body mt-[10px] max-w-[34ch] text-[14px] leading-[23px]">
          {{ description }}
        </p>
      </div>

      <div
        class="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/70 text-[color:var(--app-accent-strong)] shadow-[0_16px_36px_rgba(13,106,223,0.14)]"
      >
        <DashboardIcon name="heart-link" :size="28" />
      </div>
    </div>

    <div class="mt-[20px] grid grid-cols-2 gap-[12px] sm:grid-cols-4">
      <article
        v-for="stat in stats"
        :key="stat.label"
        class="app-hero-stat rounded-[1.4rem] border border-white/65 bg-white/70 px-[16px] py-[16px] backdrop-blur-[12px]"
      >
        <div
          class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-accent-soft)] text-[color:var(--app-accent-strong)]"
        >
          <DashboardIcon :name="stat.icon" :size="18" />
        </div>
        <p class="app-label mt-[12px]">{{ stat.label }}</p>
        <p class="app-metric-value mt-[8px]">{{ stat.value }}</p>
      </article>
    </div>
  </section>
</template>
