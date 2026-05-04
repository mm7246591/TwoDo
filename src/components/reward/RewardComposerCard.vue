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
  <section class="rounded-[var(--app-radius-xl)] border border-[var(--app-border)] bg-[var(--app-surface)] p-[20px] shadow-[var(--app-shadow-card)] backdrop-blur-[14px]">
    <div class="mb-[18px] grid gap-[4px]">
      <p class="m-[0px] text-[18px] font-[800] leading-[1.3] tracking-[0px] text-[var(--app-text-strong)]">新增願望</p>
      <p class="m-[0px] text-[14px] font-[600] leading-[1.5] text-[var(--app-text-muted)]">
        寫下對方可以用點數兌換的小獎勵。
      </p>
    </div>

    <form class="grid gap-[14px]" @submit.prevent="handleSubmit">
      <label class="grid gap-[8px]">
        <span class="text-[14px] font-[700] leading-[1.4] text-[var(--app-text-muted)]">獎勵名稱</span>
        <input
          v-model="form.title"
          class="w-full rounded-[22px] border border-[var(--app-input-border)] bg-[var(--app-input-bg)] px-[16px] py-[14px] text-[15px] font-[600] leading-[1.4] text-[var(--app-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition-[border-color,box-shadow,background-color,transform] duration-[180ms] placeholder:text-[var(--app-input-placeholder)] focus:border-[var(--app-input-focus-border)] focus:bg-[var(--app-input-focus-bg)] focus:shadow-[0_0_0_4px_var(--app-input-focus-ring),0_10px_28px_var(--app-input-focus-shadow)] focus:outline-none"
          type="text"
          placeholder="輸入獎勵名稱"
        />
      </label>

      <label class="grid gap-[8px]">
        <span class="text-[14px] font-[700] leading-[1.4] text-[var(--app-text-muted)]">說明</span>
        <textarea
          v-model="form.description"
          class="min-h-[96px] w-full resize-none rounded-[22px] border border-[var(--app-input-border)] bg-[var(--app-input-bg)] px-[16px] py-[14px] text-[15px] font-[600] leading-[1.5] text-[var(--app-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition-[border-color,box-shadow,background-color,transform] duration-[180ms] placeholder:text-[var(--app-input-placeholder)] focus:border-[var(--app-input-focus-border)] focus:bg-[var(--app-input-focus-bg)] focus:shadow-[0_0_0_4px_var(--app-input-focus-ring),0_10px_28px_var(--app-input-focus-shadow)] focus:outline-none"
          placeholder="補充獎勵說明"
        />
      </label>

      <div class="grid gap-[12px] sm:grid-cols-2">
        <label class="grid gap-[8px]">
          <span class="text-[14px] font-[700] leading-[1.4] text-[var(--app-text-muted)]">需要點數</span>
          <input
            v-model="form.cost"
            class="w-full rounded-[22px] border border-[var(--app-input-border)] bg-[var(--app-input-bg)] px-[16px] py-[14px] text-[15px] font-[700] leading-[1.4] text-[var(--app-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition-[border-color,box-shadow,background-color,transform] duration-[180ms] placeholder:text-[var(--app-input-placeholder)] focus:border-[var(--app-input-focus-border)] focus:bg-[var(--app-input-focus-bg)] focus:shadow-[0_0_0_4px_var(--app-input-focus-ring),0_10px_28px_var(--app-input-focus-shadow)] focus:outline-none"
            type="number"
            min="1"
            step="1"
          />
        </label>

        <label class="grid gap-[8px]">
          <span class="text-[14px] font-[700] leading-[1.4] text-[var(--app-text-muted)]">上架狀態</span>
          <div class="flex min-h-[52px] w-full items-center justify-between gap-[12px] rounded-[22px] border border-[var(--app-input-border)] bg-[var(--app-input-bg)] px-[16px] py-[12px] text-[var(--app-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
            <span
              :class="[
                'text-[15px] font-[700] leading-[1.4]',
                isRewardActive ? 'text-[var(--app-text-strong)]' : 'text-[var(--app-text-soft)]',
              ]"
            >
              {{ isRewardActive ? "開放兌換" : "暫停兌換" }}
            </span>
            <Switch
              v-model="isRewardActive"
              size="24px"
              active-color="var(--app-accent-strong)"
              inactive-color="var(--color-neutral-300)"
            />
          </div>
        </label>
      </div>

      <button
        class="mt-[10px] inline-flex min-h-[48px] w-full items-center justify-center gap-[8px] rounded-full border-0 bg-[linear-gradient(135deg,var(--app-accent)_0%,var(--app-accent-strong)_100%)] px-[16px] py-[12px] text-[15px] font-[800] text-[var(--app-text-on-accent)] shadow-[var(--app-button-primary-shadow)] transition-[transform,box-shadow,background-color,border-color,color] duration-[180ms] hover:enabled:-translate-y-[1px] hover:enabled:shadow-[var(--app-button-primary-shadow-hover)] focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--app-input-focus-ring),var(--app-shadow-chip)] disabled:cursor-not-allowed disabled:shadow-none disabled:opacity-55"
        type="submit"
        :disabled="props.isSubmitting"
      >
        {{ props.isSubmitting ? "新增中..." : "新增獎勵" }}
      </button>
    </form>
  </section>
</template>

<spec lang="md">
#### 1. 說明

- 顯示新增獎勵表單，讓使用者設定願望名稱、說明、兌換點數與上架狀態。

#### 2. 功能需求

- 1) 使用者輸入獎勵名稱、說明與需要點數。
- 2) 使用者切換上架狀態時，表單顯示開放兌換或暫停兌換。
- 3) 使用者送出表單後，元件送出建立獎勵資料並重設表單。
- A1：送出期間按鈕進入 disabled 狀態並顯示新增中。

#### 3. 對接口

- props：is-submitting：控制送出期間的按鈕狀態。
- emit：submit(payload)：送出建立獎勵需要的名稱、說明、點數與啟用狀態。
- defineModel：無。
</spec>


