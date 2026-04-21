<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { DatePicker, Picker, Popup, type PickerConfirmEventParams } from "vant";
import type { CreateTaskInput } from "@/pinia/tasks/types/interface";

interface TaskComposerForm {
  assignedTo: string;
  description: string;
  dueDate: string;
  points: number;
  title: string;
}

const props = defineProps<{
  assigneeLabel?: string;
  defaultAssignedTo: string;
  isSubmitting: boolean;
}>();

const emit = defineEmits<{
  submit: [payload: Omit<CreateTaskInput, "coupleId" | "createdBy">];
}>();

const form = ref<TaskComposerForm>({
  assignedTo: props.defaultAssignedTo,
  description: "",
  dueDate: "",
  points: 10,
  title: "",
});

const showDueDatePicker = ref(false);
const showAssigneePicker = ref(false);
const datePickerValue = ref<string[]>([]);
const assigneePickerValue = ref<string[]>([]);
const getPartnerLabel = computed(() => props.assigneeLabel?.trim() || "另一半");
const assigneeOptions = computed(() => {
  if (!props.defaultAssignedTo) {
    return [
      {
        disabled: true,
        text: "尚未完成配對",
        value: "",
      },
    ];
  }

  return [
    {
      text: getPartnerLabel.value,
      value: props.defaultAssignedTo,
    },
  ];
});
const getDueDateLabel = computed(() => {
  if (!form.value.dueDate) {
    return "選擇截止日";
  }

  return new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium" }).format(
    new Date(form.value.dueDate),
  );
});
const getAssigneeLabel = computed(() => {
  if (!form.value.assignedTo) {
    return "請選擇對象";
  }

  const selectedOption = assigneeOptions.value.find(
    (option) => option.value === form.value.assignedTo,
  );

  return selectedOption?.text ?? getPartnerLabel.value;
});
const minDueDate = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
});

watch(
  () => props.defaultAssignedTo,
  (partnerUid) => {
    if (!form.value.assignedTo && partnerUid) {
      form.value.assignedTo = partnerUid;
    }
  },
  { immediate: true },
);

const resetForm = () => {
  form.value.title = "";
  form.value.description = "";
  form.value.points = 10;
  form.value.dueDate = "";
  form.value.assignedTo = props.defaultAssignedTo;
  datePickerValue.value = [];
};

const openDueDatePicker = () => {
  const baseDate = form.value.dueDate
    ? new Date(form.value.dueDate)
    : minDueDate.value;

  datePickerValue.value = [
    String(baseDate.getFullYear()),
    String(baseDate.getMonth() + 1).padStart(2, "0"),
    String(baseDate.getDate()).padStart(2, "0"),
  ];
  showDueDatePicker.value = true;
};

const openAssigneePicker = () => {
  assigneePickerValue.value = [
    form.value.assignedTo || props.defaultAssignedTo || "",
  ];
  showAssigneePicker.value = true;
};

const handleConfirmDueDate = ({
  selectedValues,
}: {
  selectedValues: string[];
}) => {
  form.value.dueDate = `${selectedValues[0]}-${selectedValues[1]}-${selectedValues[2]}`;
  showDueDatePicker.value = false;
};

const handleConfirmAssignee = ({
  selectedValues,
}: PickerConfirmEventParams) => {
  form.value.assignedTo = String(selectedValues[0] ?? "");
  showAssigneePicker.value = false;
};

const handleSubmit = () => {
  emit("submit", {
    assignedTo: form.value.assignedTo,
    description: form.value.description,
    dueDate: form.value.dueDate ? new Date(form.value.dueDate) : null,
    points: Number(form.value.points),
    title: form.value.title,
  });

  resetForm();
};
</script>

<template>
  <section class="app-card px-[20px] py-[20px]">
    <div class="flex items-center justify-between gap-[12px]">
      <div>
        <p class="app-label">新增任務</p>
        <p
          class="app-text-strong mt-[8px] text-[24px] font-semibold tracking-[-0.04em]"
        >
          建一張可追蹤的待辦
        </p>
      </div>

      <div class="app-accent-panel px-[12px] py-[8px] text-right">
        <p class="app-kicker">Firestore</p>
        <p class="app-text-strong mt-[4px] text-[14px] font-semibold">tasks</p>
      </div>
    </div>

    <form class="mt-[20px] space-y-[16px]" @submit.prevent="handleSubmit">
      <label class="block space-y-[8px]">
        <span class="app-field-label">標題</span>
        <input
          v-model="form.title"
          class="app-input"
          type="text"
          placeholder="例如：倒垃圾"
        />
      </label>

      <label class="block space-y-[8px]">
        <span class="app-field-label">描述</span>
        <textarea
          v-model="form.description"
          class="app-input min-h-[96px] resize-none py-[16px]"
          placeholder="補充任務細節或截止提醒"
        />
      </label>

      <div class="grid grid-cols-2 gap-[16px]">
        <label class="block space-y-[8px]">
          <span class="app-field-label">點數</span>
          <input
            v-model="form.points"
            class="app-input"
            type="number"
            min="1"
            step="1"
          />
        </label>

        <label class="block space-y-[8px]">
          <span class="app-field-label">截止日</span>
          <button
            class="app-input flex items-center justify-between text-left"
            type="button"
            @click="openDueDatePicker"
          >
            <span :class="form.dueDate ? 'app-text-strong' : 'app-text-soft'">
              {{ getDueDateLabel }}
            </span>
          </button>
        </label>
      </div>

      <label class="block space-y-[8px]">
        <span class="app-field-label">指派對象</span>
        <button
          class="app-input flex items-center justify-between text-left"
          type="button"
          @click="openAssigneePicker"
        >
          <span :class="form.assignedTo ? 'app-text-strong' : 'app-text-soft'">
            {{ getAssigneeLabel }}
          </span>
        </button>
      </label>

      <button
        class="app-primary-button mt-[24px] w-full"
        type="submit"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? "建立中..." : "建立任務" }}
      </button>
    </form>

    <Popup
      v-model:show="showDueDatePicker"
      position="bottom"
      round
      safe-area-inset-bottom
      teleport="body"
    >
      <DatePicker
        v-model="datePickerValue"
        title="截止日"
        cancel-button-text="取消"
        confirm-button-text="確認"
        :min-date="minDueDate"
        :max-date="new Date(2035, 11, 31)"
        @cancel="showDueDatePicker = false"
        @confirm="handleConfirmDueDate"
      />
    </Popup>

    <Popup
      v-model:show="showAssigneePicker"
      position="bottom"
      round
      safe-area-inset-bottom
      teleport="body"
    >
      <Picker
        v-model="assigneePickerValue"
        title="指派對象"
        cancel-button-text="取消"
        confirm-button-text="確認"
        :columns="assigneeOptions"
        @cancel="showAssigneePicker = false"
        @confirm="handleConfirmAssignee"
      />
    </Popup>
  </section>
</template>
