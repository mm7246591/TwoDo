<script setup lang="ts">
import MobileAppShell from '@/components/MobileAppShell.vue'

defineProps<{
  shellClass: string
  title: string
  description: string
  cardTitle: string
  cardDescription: string
}>()
</script>

<template>
  <MobileAppShell
    :shell-class="shellClass"
    frame-class="border border-white/70 bg-white/80 backdrop-blur"
  >
    <section class="space-y-4 px-5 pb-6 pt-8 sm:px-7 sm:pt-10">
      <div class="inline-flex items-center rounded-full bg-slate-950 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-white">
        TwoDo
      </div>
      <div class="space-y-3">
        <h1 class="text-[2rem] font-semibold leading-tight text-slate-950">
          {{ title }}
        </h1>
        <p class="text-sm leading-6 text-slate-600">
          {{ description }}
        </p>
      </div>
    </section>

    <section class="flex-1 rounded-t-[2rem] bg-slate-950 px-5 pb-6 pt-6 text-white sm:px-7 sm:pt-7">
      <div class="mb-5 space-y-2">
        <h2 class="text-lg font-semibold">{{ cardTitle }}</h2>
        <p class="text-sm leading-6 text-slate-300">
          {{ cardDescription }}
        </p>
      </div>

      <slot />
    </section>
  </MobileAppShell>
</template>
