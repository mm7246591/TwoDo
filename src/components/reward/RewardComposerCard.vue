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
  <section class="app-card app-card-section">
    <form class="app-form-stack" @submit.prevent="handleSubmit">
      <label class="app-field-stack block">
        <span class="app-field-label">獎勵名稱</span>
        <input
          v-model="form.title"
          class="app-input"
          type="text"
          placeholder="例如：按摩一次"
        />
      </label>

      <label class="app-field-stack block">
        <span class="app-field-label">備註</span>
        <textarea
          v-model="form.description"
          class="app-input min-h-[96px] resize-none py-[16px]"
          placeholder="補充內容或小約定"
        />
      </label>

      <div class="app-form-grid-2">
        <label class="app-field-stack block">
          <span class="app-field-label">所需點數</span>
          <input
            v-model="form.cost"
            class="app-input"
            type="number"
            min="1"
            step="1"
          />
        </label>

        <label class="app-field-stack block">
          <span class="app-field-label">開放兌換</span>
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
        {{ props.isSubmitting ? "新增中..." : "新增獎勵" }}
      </button>
    </form>
  </section>
</template>
