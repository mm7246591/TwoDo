<script setup lang="ts">
import MobileAppShell from '@/components/MobileAppShell.vue'

defineProps<{
  cardDescription: string
  cardTitle: string
  description: string
  title: string
}>()
</script>

<template>
  <MobileAppShell>
    <section class="relative px-5 pb-5 pt-8 sm:px-7 sm:pt-10">
      <div class="app-chip">
        TwoDo
      </div>

      <div class="mt-5 space-y-4">
        <div class="app-eyebrow">
          <span class="app-eyebrow-dot" />
          兩個人的日常
        </div>

        <div class="grid min-h-[140px] content-start gap-3 sm:min-h-[128px]">
          <h1 class="app-display-title max-w-[14ch]">
            {{ title }}
          </h1>
          <p class="app-display-summary">
            {{ description }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="app-card-muted flex h-full flex-col p-4">
            <p class="app-label">一起分擔</p>
            <p class="app-inline-title mt-2">
              把日常小事分好，也記得給點鼓勵。
            </p>
          </div>

          <div class="app-card-muted flex h-full flex-col p-4">
            <p class="app-label">小小獎勵</p>
            <p class="app-inline-title mt-2">
              用點數換彼此說好的小獎勵。
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="app-section-panel mt-auto rounded-t-[32px] px-5 pb-6 pt-6 sm:px-7 sm:pt-7">
      <div class="mb-5 flex min-h-[120px] items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="app-kicker">開始使用</p>
          <h2 class="app-card-title mt-2">
            {{ cardTitle }}
          </h2>
          <p class="app-card-caption mt-2">
            {{ cardDescription }}
          </p>
        </div>

        <div class="app-card flex shrink-0 items-center gap-2 p-3">
          <span class="app-signal app-signal-success" />
          <span class="app-signal app-signal-accent" />
          <span class="app-signal app-signal-neutral" />
        </div>
      </div>

      <slot />
    </section>
  </MobileAppShell>
</template>
