<script setup lang="ts">
import { computed, ref } from "vue";
import { Switch } from "vant";
import type { CreateRewardInput } from "@/pinia/rewards/types/interface";
import type { RewardComposerForm } from "@/views/reward/types/interface";

const emit = defineEmits<{
  submit: [payload: Omit<CreateRewardInput, "coupleId" | "createdBy">];
}>();
const props = defineProps<{
  isSubmitting: boolean;
}>();

const form = ref<RewardComposerForm>({
  title: "",
  description: "",
  cost: 30,
  visibility: "active",
});

const resetForm = () => {
  form.value.title = "";
  form.value.description = "";
  form.value.cost = 30;
  form.value.visibility = "active";
};

const isRewardActive = computed({
  get: () => form.value.visibility === "active",
  set: (isActive: boolean) => {
    form.value.visibility = isActive ? "active" : "inactive";
  },
});

const handleSubmit = () => {
  emit("submit", {
    title: form.value.title,
    description: form.value.description,
    cost: Number(form.value.cost),
    isActive: form.value.visibility === "active",
  });

  resetForm();
};
</script>

<template>
  <section class="rounded-[var(--app-radius-xl)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] backdrop-blur-[14px] p-[20px]">
    <form class="grid gap-[16px]" @submit.prevent="handleSubmit">
      <label class="grid gap-[8px] block">
        <span class="text-[15px] font-[600] text-[var(--app-text-muted)]">獎勵名稱</span>
        <input
          v-model="form.title"
          class="w-full rounded-[1.35rem] border border-[var(--app-input-border)] bg-[var(--app-input-bg)] px-[16px] py-[0.95rem] text-[var(--app-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition-[border-color,box-shadow,background-color,transform] duration-[180ms] placeholder:text-[var(--app-input-placeholder)] focus:border-[var(--app-input-focus-border)] focus:bg-[var(--app-input-focus-bg)] focus:shadow-[0_0_0_4px_var(--app-input-focus-ring),0_10px_28px_var(--app-input-focus-shadow)] focus:outline-none"
          type="text"
          placeholder="輸入獎勵名稱"
        />
      </label>

      <label class="grid gap-[8px] block">
        <span class="text-[15px] font-[600] text-[var(--app-text-muted)]">說明</span>
        <textarea
          v-model="form.description"
          class="w-full min-h-[96px] resize-none rounded-[1.35rem] border border-[var(--app-input-border)] bg-[var(--app-input-bg)] px-[16px] py-[16px] text-[var(--app-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition-[border-color,box-shadow,background-color,transform] duration-[180ms] placeholder:text-[var(--app-input-placeholder)] focus:border-[var(--app-input-focus-border)] focus:bg-[var(--app-input-focus-bg)] focus:shadow-[0_0_0_4px_var(--app-input-focus-ring),0_10px_28px_var(--app-input-focus-shadow)] focus:outline-none"
          placeholder="補充獎勵說明"
        />
      </label>

      <div class="grid gap-[16px] sm:grid-cols-2">
        <label class="grid gap-[8px] block">
          <span class="text-[15px] font-[600] text-[var(--app-text-muted)]">需要點數</span>
          <input
            v-model="form.cost"
            class="w-full rounded-[1.35rem] border border-[var(--app-input-border)] bg-[var(--app-input-bg)] px-[16px] py-[0.95rem] text-[var(--app-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition-[border-color,box-shadow,background-color,transform] duration-[180ms] placeholder:text-[var(--app-input-placeholder)] focus:border-[var(--app-input-focus-border)] focus:bg-[var(--app-input-focus-bg)] focus:shadow-[0_0_0_4px_var(--app-input-focus-ring),0_10px_28px_var(--app-input-focus-shadow)] focus:outline-none"
            type="number"
            min="1"
            step="1"
          />
        </label>

        <label class="grid gap-[8px] block">
          <span class="text-[15px] font-[600] text-[var(--app-text-muted)]">上架狀態</span>
          <div class="flex w-full items-center justify-between gap-[12px] rounded-[1.35rem] border border-[var(--app-input-border)] bg-[var(--app-input-bg)] px-[16px] py-[0.95rem] text-[var(--app-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition-[border-color,box-shadow,background-color,transform] duration-[180ms] placeholder:text-[var(--app-input-placeholder)] focus:border-[var(--app-input-focus-border)] focus:bg-[var(--app-input-focus-bg)] focus:shadow-[0_0_0_4px_var(--app-input-focus-ring),0_10px_28px_var(--app-input-focus-shadow)] focus:outline-none">
            <span :class="isRewardActive ? 'text-[var(--app-text-strong)]' : 'text-[var(--app-text-soft)]'">
              {{ isRewardActive ? "開放兌換" : "暫停兌換" }}
            </span>
            <Switch
              v-model="isRewardActive"
              size="24px"
              active-color="#111827"
              inactive-color="#d1d5db"
            />
          </div>
        </label>
      </div>

      <button
        class="inline-flex items-center justify-center gap-[8px] rounded-full border-0 bg-[linear-gradient(135deg,var(--app-accent)_0%,var(--app-accent-strong)_100%)] px-[16px] py-[12px] text-[15px] font-[700] text-[var(--app-text-on-accent)] shadow-[var(--app-button-primary-shadow)] transition-[transform,box-shadow,background-color,border-color,color] duration-[180ms] hover:enabled:-translate-y-[1px] hover:enabled:shadow-[var(--app-button-primary-shadow-hover)] focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--app-input-focus-ring),var(--app-shadow-chip)] disabled:cursor-not-allowed disabled:shadow-none disabled:opacity-55 mt-[24px] w-full"
        type="submit"
        :disabled="props.isSubmitting"
      >
        {{ props.isSubmitting ? "新增中..." : "新增獎勵" }}
      </button>
    </form>
  </section>
</template>




