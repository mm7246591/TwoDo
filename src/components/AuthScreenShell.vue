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
    <section class="relative px-[20px] pb-[20px] pt-[32px] sm:px-[28px] sm:pt-[40px]">
      <div class="app-chip">
        TwoDo
      </div>

      <div class="mt-[20px] space-y-[16px]">
        <div class="app-eyebrow">
          <span class="app-eyebrow-dot" />
          兩個人的日常
        </div>

        <div class="grid min-h-[140px] content-start gap-[12px] sm:min-h-[128px]">
          <h1 class="app-display-title max-w-[14ch]">
            {{ title }}
          </h1>
          <p class="app-display-summary">
            {{ description }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-[12px]">
          <div class="app-card-muted flex h-full flex-col p-[16px]">
            <p class="app-label">一起分擔</p>
            <p class="app-inline-title mt-[8px]">
              把日常小事分好，也記得給點鼓勵。
            </p>
          </div>

          <div class="app-card-muted flex h-full flex-col p-[16px]">
            <p class="app-label">小小獎勵</p>
            <p class="app-inline-title mt-[8px]">
              用點數換彼此說好的小獎勵。
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="app-section-panel mt-auto rounded-t-[32px] px-[20px] pb-[24px] pt-[24px] sm:px-[28px] sm:pt-[28px]">
      <div class="mb-[20px] flex min-h-[120px] items-start justify-between gap-[16px]">
        <div class="min-w-[0px]">
          <p class="app-kicker">開始使用</p>
          <h2 class="app-card-title mt-[8px]">
            {{ cardTitle }}
          </h2>
          <p class="app-card-caption mt-[8px]">
            {{ cardDescription }}
          </p>
        </div>

        <div class="app-card flex shrink-0 items-center gap-[8px] p-[12px]">
          <span class="app-signal app-signal-success" />
          <span class="app-signal app-signal-accent" />
          <span class="app-signal app-signal-neutral" />
        </div>
      </div>

      <slot />
    </section>
  </MobileAppShell>
</template>
