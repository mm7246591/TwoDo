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
          Account Access
        </div>

        <div class="grid min-h-[140px] content-start gap-[12px] sm:min-h-[128px]">
          <h1 class="app-text-strong max-w-[14ch] text-[35px] font-semibold leading-[1.05] tracking-[-0.04em]">
            {{ title }}
          </h1>
          <p class="app-text-muted max-w-[32ch] text-[14px] leading-[24px]">
            {{ description }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-[12px]">
          <div class="app-card-muted flex h-full flex-col px-[16px] py-[12px]">
            <p class="app-label">共享任務</p>
            <p class="app-text-strong mt-[8px] text-[14px] font-semibold">
              先把兩位使用者綁進同一組 couple，後面的任務、獎勵與通知才會有共同資料脈絡。
            </p>
          </div>

          <div class="app-card-muted flex h-full flex-col px-[16px] py-[12px]">
            <p class="app-label">MVP 目標</p>
            <p class="app-text-strong mt-[8px] text-[14px] font-semibold">
              先把登入、配對與任務流程接穩，後面再逐步補積分、兌換與通知。
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="app-section-panel mt-auto rounded-t-[32px] px-[20px] pb-[24px] pt-[24px] sm:px-[28px] sm:pt-[28px]">
      <div class="mb-[20px] flex min-h-[120px] items-start justify-between gap-[16px]">
        <div class="min-w-0">
          <p class="app-kicker">Account Flow</p>
          <h2 class="app-text-strong mt-[8px] text-[20px] font-semibold tracking-[-0.03em]">
            {{ cardTitle }}
          </h2>
          <p class="app-text-muted mt-[8px] text-[14px] leading-[24px]">
            {{ cardDescription }}
          </p>
        </div>

        <div class="app-card flex shrink-0 items-center gap-[8px] px-[12px] py-[12px]">
          <span class="app-signal app-signal-success" />
          <span class="app-signal app-signal-accent" />
          <span class="app-signal app-signal-neutral" />
        </div>
      </div>

      <slot />
    </section>
  </MobileAppShell>
</template>
