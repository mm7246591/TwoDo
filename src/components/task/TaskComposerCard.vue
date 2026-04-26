<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { DatePicker, Popup } from "vant";
import type { CreateTaskInput } from "@/pinia/tasks/types/interface";
import type { TaskComposerForm } from "@/views/task/types/interface";

type AssigneeOption = "me" | "partner" | "couple";

const props = defineProps<{
  assigneeLabel?: string;
  currentUid: string;
  defaultAssignedTo: string;
  isSubmitting: boolean;
}>();

const emit = defineEmits<{
  submit: [payload: Omit<CreateTaskInput, "coupleId" | "createdBy">];
}>();

const form = ref<TaskComposerForm>({
  assignedTo: props.defaultAssignedTo,
  assignmentType: "user",
  description: "",
  dueDate: "",
  points: 250,
  title: "",
});

const showDueDatePicker = ref(false);
const datePickerValue = ref<string[]>([]);

const getPartnerLabel = computed(() => props.assigneeLabel?.trim() || "你");
const getSelectedAssignee = computed<AssigneeOption>(() => {
  if (form.value.assignmentType === "couple") {
    return "couple";
  }

  return form.value.assignedTo === props.currentUid ? "me" : "partner";
});
const getDueDateLabel = computed(() => {
  if (!form.value.dueDate) {
    return "選擇日期";
  }

  return new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium" }).format(
    new Date(form.value.dueDate),
  );
});
const minDueDate = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
});
const canSubmit = computed(
  () =>
    Boolean(form.value.title.trim()) &&
    (form.value.assignmentType === "couple" || Boolean(form.value.assignedTo)) &&
    !props.isSubmitting,
);

watch(
  () => props.defaultAssignedTo,
  (partnerUid) => {
    if (
      form.value.assignmentType === "user" &&
      getSelectedAssignee.value === "partner"
    ) {
      form.value.assignedTo = partnerUid;
    }
  },
  { immediate: true },
);

function resetForm() {
  form.value.title = "";
  form.value.description = "";
  form.value.points = 250;
  form.value.dueDate = "";
  form.value.assignmentType = "user";
  form.value.assignedTo = props.defaultAssignedTo;
  datePickerValue.value = [];
}

function selectAssignee(option: AssigneeOption) {
  if (option === "couple") {
    form.value.assignmentType = "couple";
    form.value.assignedTo = null;
    return;
  }

  form.value.assignmentType = "user";
  form.value.assignedTo =
    option === "me" ? props.currentUid : props.defaultAssignedTo;
}

function openDueDatePicker() {
  const baseDate = form.value.dueDate
    ? new Date(form.value.dueDate)
    : minDueDate.value;

  datePickerValue.value = [
    String(baseDate.getFullYear()),
    String(baseDate.getMonth() + 1).padStart(2, "0"),
    String(baseDate.getDate()).padStart(2, "0"),
  ];
  showDueDatePicker.value = true;
}

function clearDueDate() {
  form.value.dueDate = "";
  datePickerValue.value = [];
}

function handleConfirmDueDate({
  selectedValues,
}: {
  selectedValues: string[];
}) {
  form.value.dueDate = `${selectedValues[0]}-${selectedValues[1]}-${selectedValues[2]}`;
  showDueDatePicker.value = false;
}

function handleSubmit() {
  if (!canSubmit.value) {
    return;
  }

  emit("submit", {
    assignedTo: form.value.assignedTo,
    assignmentType: form.value.assignmentType,
    description: form.value.description.trim(),
    dueDate: form.value.dueDate ? new Date(form.value.dueDate) : null,
    points: Number(form.value.points),
    title: form.value.title.trim(),
  });

  resetForm();
}
</script>

<template>
  <section class="grid gap-[24px] text-[#211a18]" aria-labelledby="task-composer-title">
    <div class="grid gap-[4px] px-[4px]">
      <h2 id="task-composer-title" class="m-[0px] text-[32px] font-[800] leading-[1.18] text-[#211a18]">
        新冒險
      </h2>
      <p class="m-[0px] text-[16px] leading-normal text-[#54433e]">今天想計畫些什麼？</p>
    </div>

    <form
      class="grid gap-[24px] rounded-3xl border border-white/85 bg-white/95 bg-gradient-to-b from-white/95 to-[#fffdfb]/95 p-[24px] shadow-[0_8px_32px_rgba(148,72,53,0.08)] sm:p-[32px]"
      @submit.prevent="handleSubmit"
    >
      <label class="grid gap-[8px]">
        <span class="m-[0px] pl-[8px] text-[15px] font-[700] leading-snug text-[#54433e]">冒險名稱</span>
        <input
          v-model="form.title"
          class="w-full rounded-[0.9rem] border-0 bg-[#ede0db] px-[12px] py-[16px] text-[16px] leading-normal text-[#211a18] outline-none transition-[background-color,box-shadow] duration-200 placeholder:text-[#87726d] focus:bg-white focus:shadow-[0_0_0_2px_#ff9e85,0_4px_16px_rgba(255,158,133,0.3)]"
          type="text"
          placeholder="例如：週日的農夫市集"
          autocomplete="off"
        />
      </label>

      <label class="grid gap-[8px]">
        <span class="m-[0px] pl-[8px] text-[15px] font-[700] leading-snug text-[#54433e]">詳細內容（選填）</span>
        <textarea
          v-model="form.description"
          class="min-h-[112px] w-full resize-none rounded-[0.9rem] border-0 bg-[#ede0db] px-[12px] py-[16px] text-[16px] leading-normal text-[#211a18] outline-none transition-[background-color,box-shadow] duration-200 placeholder:text-[#87726d] focus:bg-white focus:shadow-[0_0_0_2px_#ff9e85,0_4px_16px_rgba(255,158,133,0.3)]"
          placeholder="可以補充地點、時間或完成標準..."
          rows="3"
        />
      </label>

      <div class="grid gap-[8px]">
        <span class="m-[0px] pl-[8px] text-[15px] font-[700] leading-snug text-[#54433e]">這件事誰來做？</span>
        <div class="grid grid-cols-3 gap-[12px]" role="group" aria-label="任務指派對象">
          <button
            class="min-w-[0px] rounded-full border-0 px-[10px] py-[12px] text-[15px] font-[800] transition-[background-color,color,transform,box-shadow] duration-200 active:enabled:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            :class="getSelectedAssignee === 'me' ? 'bg-[#b3efd8] text-[#356e5c] shadow-[0_8px_18px_rgba(47,104,87,0.12)]' : 'bg-[#ede0db] text-[#54433e]'"
            type="button"
            :disabled="!currentUid"
            @click="selectAssignee('me')"
          >
            我
          </button>
          <button
            class="min-w-[0px] rounded-full border-0 px-[10px] py-[12px] text-[15px] font-[800] transition-[background-color,color,transform,box-shadow] duration-200 active:enabled:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            :class="getSelectedAssignee === 'partner' ? 'bg-[#b3efd8] text-[#356e5c] shadow-[0_8px_18px_rgba(47,104,87,0.12)]' : 'bg-[#ede0db] text-[#54433e]'"
            type="button"
            :disabled="!defaultAssignedTo"
            @click="selectAssignee('partner')"
          >
            {{ getPartnerLabel }}
          </button>
          <button
            class="min-w-[0px] rounded-full border-0 px-[10px] py-[12px] text-[15px] font-[800] transition-[background-color,color,transform,box-shadow] duration-200 active:enabled:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            :class="getSelectedAssignee === 'couple' ? 'bg-[#b3efd8] text-[#356e5c] shadow-[0_8px_18px_rgba(47,104,87,0.12)]' : 'bg-[#ede0db] text-[#54433e]'"
            type="button"
            @click="selectAssignee('couple')"
          >
            一起
          </button>
        </div>
      </div>

      <section class="grid gap-[12px] rounded-2xl bg-[#f9ebe7] p-[20px]" aria-labelledby="reward-title">
        <div class="flex items-center justify-between gap-[12px]">
          <span id="reward-title" class="m-[0px] inline-flex items-center gap-[8px] text-[15px] font-[800] text-[#211a18]">
            <span class="material-symbols-outlined fill text-xl text-[#944835]" aria-hidden="true">
              stars
            </span>
            獎勵點數
          </span>
          <strong class="m-[0px] text-[24px] font-[800] leading-tight text-[#944835] [font-variant-numeric:tabular-nums]">
            +{{ form.points }}
          </strong>
        </div>
        <input
          v-model.number="form.points"
          class="mt-[6px] w-full appearance-none bg-transparent [&::-moz-range-thumb]:h-[24px] [&::-moz-range-thumb]:w-[24px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#944835] [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(148,72,53,0.3)] [&::-moz-range-track]:h-[8px] [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[#ede0db] [&::-webkit-slider-runnable-track]:h-[8px] [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-[#ede0db] [&::-webkit-slider-thumb]:-mt-2 [&::-webkit-slider-thumb]:h-[24px] [&::-webkit-slider-thumb]:w-[24px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#944835] [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(148,72,53,0.3)]"
          type="range"
          min="0"
          max="1000"
          step="50"
        />
        <div class="m-[0px] flex items-center justify-between gap-[12px] text-[12px] font-[700] text-[#87726d]" aria-hidden="true">
          <span>0</span>
          <span>1000</span>
        </div>
      </section>

      <div class="flex items-center justify-between gap-[12px]">
        <button
          class="inline-flex flex-1 items-center justify-start gap-[8px] rounded-full border-0 bg-[#fff1ec] px-[16px] py-[12px] text-[15px] font-[800] text-[#54433e]"
          type="button"
          @click="openDueDatePicker"
        >
          <span class="material-symbols-outlined text-xl" aria-hidden="true">event</span>
          <span>{{ getDueDateLabel }}</span>
        </button>
        <button
          v-if="form.dueDate"
          class="inline-flex h-[44px] w-[44px] items-center justify-center rounded-full border-0 bg-[#ede0db] text-[#54433e]"
          type="button"
          aria-label="清除日期"
          @click="clearDueDate"
        >
          <span class="material-symbols-outlined text-xl" aria-hidden="true">close</span>
        </button>
      </div>

      <button
        class="inline-flex w-full items-center justify-center gap-[8px] rounded-[1.25rem] border-0 bg-[#944835] px-[16px] py-[1.15rem] text-[15px] font-[800] text-white shadow-[0_8px_24px_rgba(148,72,53,0.4)] transition-[transform,box-shadow,opacity] duration-200 hover:enabled:shadow-[0_12px_28px_rgba(148,72,53,0.5)] active:enabled:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none"
        type="submit"
        :disabled="!canSubmit"
      >
        <span class="material-symbols-outlined fill" aria-hidden="true">
          favorite
        </span>
        {{ isSubmitting ? "建立中..." : "建立冒險" }}
      </button>
    </form>

    <Popup v-model:show="showDueDatePicker" position="bottom" round safe-area-inset-bottom teleport="body">
      <DatePicker
        v-model="datePickerValue"
        title="選擇日期"
        cancel-button-text="取消"
        confirm-button-text="確認"
        :min-date="minDueDate"
        :max-date="new Date(2035, 11, 31)"
        @cancel="showDueDatePicker = false"
        @confirm="handleConfirmDueDate"
      />
    </Popup>
  </section>
</template>


