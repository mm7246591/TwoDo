<script setup lang="ts">
import { ref } from "vue";
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
    <div class="flex items-center justify-between gap-[12px]">
      <div>
        <p class="app-label">新增獎勵</p>
        <p
          class="app-text-strong mt-[8px] text-[24px] font-semibold tracking-[-0.04em]"
        >
          建立可兌換的回報
        </p>
      </div>

      <div class="app-accent-panel px-[12px] py-[8px] text-right">
        <p class="app-kicker">Firestore</p>
        <p class="app-text-strong mt-[4px] text-[14px] font-semibold">
          rewards
        </p>
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

      <div class="grid grid-cols-2 gap-[16px]">
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
          <select v-model="form.visibility" class="app-input">
            <option value="active">啟用</option>
            <option value="inactive">停用</option>
          </select>
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
