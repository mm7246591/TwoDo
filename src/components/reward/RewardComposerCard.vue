<script setup lang="ts">
import { computed, ref } from "vue";
import { Switch } from "vant";
import type { CreateRewardInput } from "@/pinia/rewards/types/interface";
import type { RewardComposerForm } from "@/views/rewards/types/interface";

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
  <section class="app-card px-[20px] py-[20px]">
    <div class="flex flex-col gap-[14px] sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0">
        <p class="app-label">新增獎勵</p>
        <p class="app-card-title mt-[8px]">建立可兌換的回報</p>
        <p class="app-card-caption mt-[8px]">
          可以先建立，等準備好再開放兌換。
        </p>
      </div>

      <div class="flex flex-wrap gap-[8px]">
        <span
          :class="[
            'app-meta-pill',
            isRewardActive ? 'app-meta-pill-accent' : 'app-meta-pill-strong',
          ]"
        >
          {{ isRewardActive ? "建立後會立即開放" : "建立後先保持隱藏" }}
        </span>
      </div>
    </div>

    <form class="mt-[20px] space-y-[16px]" @submit.prevent="handleSubmit">
      <label class="block space-y-[8px]">
        <span class="app-field-label">名稱</span>
        <input
          v-model="form.title"
          class="app-input"
          type="text"
          placeholder="例如：按摩一次"
        />
      </label>

      <label class="block space-y-[8px]">
        <span class="app-field-label">說明</span>
        <textarea
          v-model="form.description"
          class="app-input min-h-[96px] resize-none py-[16px]"
          placeholder="補充這個獎勵的內容或兌換條件"
        />
      </label>

      <div class="grid gap-[16px] sm:grid-cols-2">
        <label class="block space-y-[8px]">
          <span class="app-field-label">所需點數</span>
          <input
            v-model="form.cost"
            class="app-input"
            type="number"
            min="1"
            step="1"
          />
        </label>

        <label class="block space-y-[8px]">
          <span class="app-field-label">狀態</span>
          <div class="app-input flex items-center justify-between gap-[12px]">
            <span :class="isRewardActive ? 'app-text-strong' : 'app-text-soft'">
              {{ isRewardActive ? "立即開放" : "先不開放" }}
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
        class="app-primary-button mt-[24px] w-full"
        type="submit"
        :disabled="props.isSubmitting"
      >
        {{ props.isSubmitting ? "建立中..." : "建立獎勵" }}
      </button>
    </form>
  </section>
</template>
