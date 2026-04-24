<script setup lang="ts">
const emit = defineEmits<{
  redeem: [];
}>();
defineProps<{
  currentPoints: number;
  userName: string;
  userPhotoUrl?: string;
}>();

const pointsFormatter = new Intl.NumberFormat("zh-TW", {
  useGrouping: true,
});

const formatPoints = (value: number) => pointsFormatter.format(value);
const getInitial = (value: string) =>
  value.trim().slice(0, 1).toUpperCase() || "T";

const handleRedeem = () => {
  emit("redeem");
};
</script>

<template>
  <section
    class="relative overflow-hidden rounded-[24px] border border-[rgba(255,255,255,0.78)] bg-[var(--app-surface-strong)] shadow-[0_18px_42px_rgba(148,72,53,0.08)]"
  >
    <div
      class="absolute right-[-48px] top-[-48px] h-[160px] w-[160px] rounded-full bg-[rgba(255,158,133,0.18)] blur-[26px]"
      aria-hidden="true"
    />

    <div
      class="relative z-[1] flex flex-col gap-[var(--app-space-20)] p-[var(--app-space-24)] min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between"
    >
      <div class="grid gap-[var(--app-space-8)]">
        <p
          class="m-[0px] text-[length:var(--app-type-12)] font-[800] leading-[1.25] tracking-[0.08em] text-[var(--app-text-soft)]"
        >
          我的點數
        </p>
        <div
          class="inline-flex min-w-[0px] items-center gap-[var(--app-space-8)]"
        >
          <span
            class="text-[40px] font-[800] leading-none tracking-[0px] text-[var(--app-accent-strong)] [font-variant-numeric:tabular-nums]"
          >
            {{ formatPoints(currentPoints) }}
          </span>
          <span
            class="material-symbols-outlined fill text-[24px] text-[var(--auth-primary-container)]"
            aria-hidden="true"
            >favorite</span
          >
        </div>
      </div>

      <div
        class="flex items-center justify-between gap-[var(--app-space-16)] min-[420px]:flex-none"
      >
        <div class="flex" :aria-label="userName">
          <span
            class="inline-flex h-[40px] w-[40px] items-center justify-center overflow-hidden rounded-full bg-[var(--app-accent-soft)] text-[length:var(--app-type-15)] font-[800] text-[var(--app-accent-strong)]"
          >
            <img
              v-if="userPhotoUrl"
              class="h-full w-full object-cover"
              :src="userPhotoUrl"
              :alt="`${userName} 的頭像`"
            />
            <span v-else>{{ getInitial(userName) }}</span>
          </span>
        </div>

        <button
          class="min-h-[40px] rounded-full border-[0px] bg-[var(--app-coral)] px-[16px] py-[10px] text-[length:var(--app-type-15)] font-[800] text-[var(--app-accent-strong)] transition-[opacity,transform] duration-[180ms] ease-in-out hover:-translate-y-[1px] hover:opacity-90 focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--app-input-focus-ring)]"
          type="button"
          @click="handleRedeem"
        >
          兌換
        </button>
      </div>
    </div>
  </section>
</template>
