<script setup lang="ts">
import MobileAppShell from '@/components/MobileAppShell.vue'

defineProps<{
  title: string
  description: string
  cardTitle: string
  cardDescription: string
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
          Account Access
        </div>

        <div class="grid min-h-[8.75rem] content-start gap-3 sm:min-h-[8rem]">
          <h1 class="app-text-strong max-w-[14ch] text-[2.2rem] font-semibold leading-[1.05] tracking-[-0.04em]">
            {{ title }}
          </h1>
          <p class="app-text-muted max-w-[32ch] text-sm leading-6">
            {{ description }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="app-card-muted flex h-full flex-col px-4 py-3">
            <p class="app-label">任務延續</p>
            <p class="app-text-strong mt-2 text-sm font-semibold">
              用同一個帳號接續今天的待辦，不用重新整理節奏。
            </p>
          </div>

          <div class="app-card-muted flex h-full flex-col px-4 py-3">
            <p class="app-label">快速進入</p>
            <p class="app-text-strong mt-2 text-sm font-semibold">
              先順利登入或建立帳號，再回到你真正要完成的事。
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="app-section-panel mt-auto rounded-t-[2rem] px-5 pb-6 pt-6 sm:px-7 sm:pt-7">
      <div class="mb-5 flex min-h-[7.5rem] items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="app-kicker">Account Flow</p>
          <h2 class="app-text-strong mt-2 text-xl font-semibold tracking-[-0.03em]">
            {{ cardTitle }}
          </h2>
          <p class="app-text-muted mt-2 text-sm leading-6">
            {{ cardDescription }}
          </p>
        </div>

        <div class="app-card flex shrink-0 items-center gap-2 px-3 py-3">
          <span class="app-signal app-signal-success" />
          <span class="app-signal app-signal-accent" />
          <span class="app-signal app-signal-neutral" />
        </div>
      </div>

      <slot />
    </section>
  </MobileAppShell>
</template>
