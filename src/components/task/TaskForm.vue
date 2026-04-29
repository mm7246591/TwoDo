<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Field, Picker, Popup } from "vant";
import type { CreateTaskInput } from "@/pinia/tasks/types/interface";
import type {
  TaskAssigneeOption,
  TaskAssigneePickerOption,
  TaskComposerForm,
  TaskDueDatePickerColumn,
  TaskDueDatePickerSelection,
} from "@/views/task/types/interface";

const emit = defineEmits<{
  submit: [payload: Omit<CreateTaskInput, "coupleId" | "createdBy">];
}>();
const props = defineProps<{
  assigneeLabel?: string;
  currentUid: string;
  defaultAssignedTo: string;
  isSubmitting: boolean;
}>();

const form = ref<TaskComposerForm>({
  assignedTo: props.defaultAssignedTo,
  assignmentType: "user",
  description: "",
  dueDate: "",
  points: 0,
  title: "",
});

const showAssigneePicker = ref(false);
const assigneePickerKey = ref(0);
const showDueDatePicker = ref(false);
const dueDatePickerKey = ref(0);
const defaultDueDatePickerDate = new Date();
/** 提供截止時間 Picker 暫存選擇值，確認後才同步到送出用欄位。 */
const dueDatePickerValue = ref<TaskDueDatePickerSelection>({
  day: defaultDueDatePickerDate.getDate(),
  hour: defaultDueDatePickerDate.getHours(),
  minute: defaultDueDatePickerDate.getMinutes(),
  month: defaultDueDatePickerDate.getMonth() + 1,
});

const getPartnerLabel = computed(() => props.assigneeLabel?.trim() || "你");
const getSelectedAssignee = computed<TaskAssigneeOption>(() => {
  if (form.value.assignmentType === "couple") {
    return "couple";
  }

  return form.value.assignedTo === props.currentUid ? "me" : "partner";
});
const getAssigneeLabel = computed(() => {
  if (getSelectedAssignee.value === "me") {
    return "我";
  }

  if (getSelectedAssignee.value === "couple") {
    return "一起";
  }

  return getPartnerLabel.value;
});
const assigneePickerColumns = computed<TaskAssigneePickerOption[]>(() => [
  {
    disabled: !props.currentUid,
    text: "我",
    value: "me",
  },
  {
    disabled: !props.defaultAssignedTo,
    text: getPartnerLabel.value,
    value: "partner",
  },
  {
    text: "一起",
    value: "couple",
  },
]);
const getAssigneePickerDefaultIndex = computed(() =>
  assigneePickerColumns.value.findIndex(
    (option) => option.value === getSelectedAssignee.value,
  ),
);
const getDueDateLabel = computed(() => {
  if (!form.value.dueDate) {
    return "選擇日期";
  }

  return new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(form.value.dueDate));
});
const canSubmit = computed(
  () =>
    Boolean(form.value.title.trim()) &&
    (form.value.assignmentType === "couple" ||
      Boolean(form.value.assignedTo)) &&
    !props.isSubmitting,
);
const getDueDatePickerColumns = computed<TaskDueDatePickerColumn[]>(() => {
  const monthOptions = createNumberOptions(1, 12, "月");
  const dayOptions = createNumberOptions(
    1,
    getMaxDayInMonth(dueDatePickerValue.value.month),
    "日",
  );
  const hourOptions = createNumberOptions(0, 23, "時");
  const minuteOptions = createNumberOptions(0, 59, "分");

  return [
    {
      defaultIndex: Math.max(dueDatePickerValue.value.month - 1, 0),
      values: monthOptions,
    },
    {
      defaultIndex: Math.min(
        Math.max(dueDatePickerValue.value.day - 1, 0),
        dayOptions.length - 1,
      ),
      values: dayOptions,
    },
    {
      defaultIndex: Math.max(dueDatePickerValue.value.hour, 0),
      values: hourOptions,
    },
    {
      defaultIndex: Math.max(dueDatePickerValue.value.minute, 0),
      values: minuteOptions,
    },
  ];
});

const resetForm = () => {
  form.value.title = "";
  form.value.description = "";
  form.value.points = 25;
  form.value.dueDate = "";
  form.value.assignmentType = "user";
  form.value.assignedTo = props.defaultAssignedTo;
  dueDatePickerValue.value = createDueDatePickerSelection(new Date());
};

const setAssignee = (option: TaskAssigneeOption) => {
  if (option === "couple") {
    form.value.assignmentType = "couple";
    form.value.assignedTo = null;
    return;
  }

  form.value.assignmentType = "user";
  form.value.assignedTo =
    option === "me" ? props.currentUid : props.defaultAssignedTo;
};

const openAssigneePicker = () => {
  assigneePickerKey.value += 1;
  showAssigneePicker.value = true;
};

const handleConfirmAssignee = (option: TaskAssigneePickerOption) => {
  setAssignee(option.value);
  showAssigneePicker.value = false;
};

/**
 * 產生固定長度的中文單位數字選項。
 *
 * @param start - 起始數字。
 * @param end - 結束數字。
 * @param unit - 顯示在數字後方的中文單位。
 * @returns 可交給 Vant Picker 顯示的選項文字。
 */
const createNumberOptions = (start: number, end: number, unit: string) => {
  return Array.from({ length: end - start + 1 }, (_, index) => {
    return `${String(start + index).padStart(2, "0")}${unit}`;
  });
};

/**
 * 取得指定月份可顯示的最大日期數。
 *
 * @param month - 一到十二月的月份數字。
 * @returns 該月份在目前年份與下一年份中的最大日期數。
 */
const getMaxDayInMonth = (month: number) => {
  const currentYear = new Date().getFullYear();
  const currentYearDays = new Date(currentYear, month, 0).getDate();
  const nextYearDays = new Date(currentYear + 1, month, 0).getDate();

  return Math.max(currentYearDays, nextYearDays);
};

/**
 * 從 Date 建立截止時間 Picker 的月日時間選取值。
 *
 * @param date - 要轉換成 Picker 選取值的日期時間。
 * @returns 對應到月、日、時、分四欄的選取值。
 */
const createDueDatePickerSelection = (
  date: Date,
): TaskDueDatePickerSelection => ({
  day: date.getDate(),
  hour: date.getHours(),
  minute: date.getMinutes(),
  month: date.getMonth() + 1,
});

/** 開啟截止時間選單，並以既有截止時間或目前時間作為初始值。 */
const openDueDatePicker = () => {
  dueDatePickerValue.value = createDueDatePickerSelection(
    form.value.dueDate ? new Date(form.value.dueDate) : new Date(),
  );
  dueDatePickerKey.value += 1;
  showDueDatePicker.value = true;
};

/**
 * 將月日時間選取值組成實際截止時間。
 *
 * @param selection - 使用者在四欄 Picker 中選擇的月日時間。
 * @returns 自動補入今年或下一年的截止時間。
 */
const createDueDateFromSelection = (selection: TaskDueDatePickerSelection) => {
  const now = new Date();
  now.setSeconds(0, 0);
  const currentYear = now.getFullYear();
  const maxDay = new Date(currentYear, selection.month, 0).getDate();
  const selectedDate = new Date(
    currentYear,
    selection.month - 1,
    Math.min(selection.day, maxDay),
    selection.hour,
    selection.minute,
  );

  if (selectedDate.getTime() >= now.getTime()) {
    return selectedDate;
  }

  const nextYearMaxDay = new Date(
    currentYear + 1,
    selection.month,
    0,
  ).getDate();
  return new Date(
    currentYear + 1,
    selection.month - 1,
    Math.min(selection.day, nextYearMaxDay),
    selection.hour,
    selection.minute,
  );
};

/**
 * 同步截止時間 Picker 滾動後的暫存選取值。
 *
 * @param values - Vant Picker 回傳的四欄文字。
 */
const syncDueDatePickerSelection = (values: string[]) => {
  const nextSelection: TaskDueDatePickerSelection = {
    day: parseInt(values[1] ?? "1", 10),
    hour: parseInt(values[2] ?? "0", 10),
    minute: parseInt(values[3] ?? "0", 10),
    month: parseInt(values[0] ?? "1", 10),
  };

  dueDatePickerValue.value = {
    ...nextSelection,
    day: Math.min(nextSelection.day, getMaxDayInMonth(nextSelection.month)),
  };
};

/**
 * 將 Vant Picker 確認的月日時間同步為送出用 ISO 字串。
 *
 * @param values - 使用者確認的月份、日期、小時與分鐘。
 */
const handleConfirmDueDate = (values: string[]) => {
  syncDueDatePickerSelection(values);
  form.value.dueDate = createDueDateFromSelection(
    dueDatePickerValue.value,
  ).toISOString();
  showDueDatePicker.value = false;
};

const handleSubmit = () => {
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
};

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
</script>

<template>
  <section
    class="grid gap-[24px] text-[#211a18]"
    aria-labelledby="task-composer-title"
  >
    <div class="grid gap-[4px] px-[4px]">
      <h2
        id="task-composer-title"
        class="m-[0px] text-[32px] font-[800] leading-[1.18] text-[#211a18]"
      >
        新任務
      </h2>
      <p class="m-[0px] text-[16px] leading-normal text-[#54433e]">
        今天想計畫些什麼？
      </p>
    </div>

    <form
      class="grid gap-[24px] rounded-3xl border border-white/85 bg-white/95 bg-gradient-to-b from-white/95 to-[#fffdfb]/95 p-[24px] shadow-[0_8px_32px_rgba(148,72,53,0.08)] sm:p-[32px]"
      @submit.prevent="handleSubmit"
    >
      <label class="grid gap-[8px]">
        <span
          class="m-[0px] pl-[8px] text-[15px] font-[700] leading-snug text-[#54433e]"
          >名稱</span
        >
        <input
          v-model="form.title"
          class="w-full rounded-[0.9rem] border-0 bg-[#ede0db] px-[12px] py-[16px] text-[16px] leading-normal text-[#211a18] outline-none transition-[background-color,box-shadow] duration-200 placeholder:text-[#87726d] focus:bg-white focus:shadow-[0_0_0_2px_#ff9e85,0_4px_16px_rgba(255,158,133,0.3)]"
          type="text"
          placeholder="請輸入任務名稱"
          autocomplete="off"
        />
      </label>

      <label class="grid gap-[8px]">
        <span
          class="m-[0px] pl-[8px] text-[15px] font-[700] leading-snug text-[#54433e]"
          >詳細內容（選填）</span
        >
        <textarea
          v-model="form.description"
          class="min-h-[112px] w-full resize-none rounded-[0.9rem] border-0 bg-[#ede0db] px-[12px] py-[16px] text-[16px] leading-normal text-[#211a18] outline-none transition-[background-color,box-shadow] duration-200 placeholder:text-[#87726d] focus:bg-white focus:shadow-[0_0_0_2px_#ff9e85,0_4px_16px_rgba(255,158,133,0.3)]"
          placeholder="可以補充地點、時間或完成標準..."
          rows="3"
        />
      </label>

      <div class="grid gap-[8px]">
        <span
          class="m-[0px] pl-[8px] text-[15px] font-[700] leading-snug text-[#54433e]"
          >指派</span
        >
        <Field
          class="flex min-h-[48px] w-full items-center rounded-full border-0 !bg-[#fff1ec] px-[16px] py-[12px] text-[#54433e] after:hidden transition-[background-color,box-shadow] duration-200 active:!bg-white [&_.van-cell__value]:min-w-[0px] [&_.van-field__body]:min-h-[24px] [&_.van-field__control]:cursor-pointer [&_.van-field__control]:text-[15px] [&_.van-field__control]:font-[800] [&_.van-field__control]:leading-[24px] [&_.van-field__control]:text-[#54433e] [&_.van-field__right-icon]:text-[#54433e]"
          :model-value="getAssigneeLabel"
          readonly
          clickable
          is-link
          :border="false"
          aria-label="任務指派對象"
          @click="openAssigneePicker"
        />
      </div>

      <section
        class="grid gap-[12px] rounded-2xl bg-[#f9ebe7] p-[20px]"
        aria-labelledby="reward-title"
      >
        <div class="flex items-center justify-between gap-[12px]">
          <span
            id="reward-title"
            class="m-[0px] inline-flex items-center gap-[8px] text-[15px] font-[800] text-[#211a18]"
          >
            <span
              class="material-symbols-outlined fill text-xl text-[#944835]"
              aria-hidden="true"
            >
              stars
            </span>
            獎勵點數
          </span>
          <strong
            class="m-[0px] text-[24px] font-[800] leading-tight text-[#944835] [font-variant-numeric:tabular-nums]"
          >
            +{{ form.points }}
          </strong>
        </div>
        <input
          v-model.number="form.points"
          class="mt-[6px] w-full appearance-none bg-transparent [&::-moz-range-thumb]:h-[24px] [&::-moz-range-thumb]:w-[24px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#944835] [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(148,72,53,0.3)] [&::-moz-range-track]:h-[8px] [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[#ede0db] [&::-webkit-slider-runnable-track]:h-[8px] [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-[#ede0db] [&::-webkit-slider-thumb]:-mt-2 [&::-webkit-slider-thumb]:h-[24px] [&::-webkit-slider-thumb]:w-[24px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#944835] [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(148,72,53,0.3)]"
          type="range"
          min="0"
          max="100"
          step="5"
          aria-label="調整獎勵點數"
        />
        <div
          class="m-[0px] flex items-center justify-between gap-[12px] text-[12px] font-[700] text-[#87726d]"
          aria-hidden="true"
        >
          <span>0</span>
          <span>100</span>
        </div>
      </section>

      <div class="flex items-center justify-between gap-[12px]">
        <button
          class="inline-flex min-w-[0px] flex-1 items-center justify-center gap-[8px] rounded-full border-0 bg-[#fff1ec] px-[16px] py-[12px] text-[15px] font-[800] text-[#54433e]"
          type="button"
          @click="openDueDatePicker"
        >
          <span class="material-symbols-outlined text-xl" aria-hidden="true"
            >event</span
          >
          <span>{{ getDueDateLabel }}</span>
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

    <Popup
      v-model:show="showAssigneePicker"
      position="bottom"
      round
      safe-area-inset-bottom
      teleport="body"
      style="
        --van-popup-background: var(--app-surface-strong);
        --van-picker-background: var(--app-surface-strong);
        --van-picker-confirm-action-color: var(--app-accent);
        --van-picker-cancel-action-color: var(--app-text-muted);
        --van-picker-option-text-color: var(--app-text-strong);
        --van-picker-title-font-size: 17px;
      "
    >
      <Picker
        :key="assigneePickerKey"
        title="請選擇指派對象"
        cancel-button-text="取消"
        confirm-button-text="確認"
        :columns="assigneePickerColumns"
        :default-index="getAssigneePickerDefaultIndex"
        @cancel="showAssigneePicker = false"
        @confirm="handleConfirmAssignee"
      />
    </Popup>

    <Popup
      v-model:show="showDueDatePicker"
      position="bottom"
      round
      safe-area-inset-bottom
      teleport="body"
      style="
        --van-popup-background: var(--app-surface-strong);
        --van-picker-background: var(--app-surface-strong);
        --van-picker-confirm-action-color: var(--app-accent);
        --van-picker-cancel-action-color: var(--app-text-muted);
        --van-picker-option-text-color: var(--app-text-strong);
        --van-picker-title-font-size: 17px;
      "
    >
      <Picker
        :key="dueDatePickerKey"
        title="請選擇截止時間"
        cancel-button-text="取消"
        confirm-button-text="確認"
        :columns="getDueDatePickerColumns"
        @cancel="showDueDatePicker = false"
        @change="syncDueDatePickerSelection"
        @confirm="handleConfirmDueDate"
      />
    </Popup>
  </section>
</template>

<spec lang="md">
## 1. 說明

- 顯示建立任務表單，讓使用者輸入任務內容、指派對象、獎勵點數與截止日期。
- 元件用於建立任務頁，送出前維持本地表單狀態。

## 2. 功能需求

- 1. 使用者輸入名稱後，表單才可送出；詳細內容與截止日期可留空。
- 2. 使用者點擊「指派」欄位時，開啟 Vant 選擇器並可選擇我、夥伴或一起。
- 3. 選擇我或夥伴時，提交單人任務並帶入對應使用者；選擇一起時，提交共同任務且不帶單一指派者。
- 4. 使用者以滑桿調整獎勵點數，範圍為 0 到 100，每次調整 5 點。
- 5. 使用者透過 Vant Picker 選擇月份、日期、小時與分鐘並按確認後，日期選單關閉且欄位顯示本地化日期時間；系統以目前年份組成截止時間，若結果早於目前時間則自動改用下一年；清除日期後，送出時日期為空。
- 6. 送出成功後，表單重設為預設指派對象、25 點、空白內容與未選日期。

## 3. 對接口

- props：assignee-label：夥伴在指派選單中的顯示名稱。
- props：current-uid：目前使用者 uid，用於建立「我」的指派值。
- props：default-assigned-to：預設夥伴 uid，用於建立夥伴指派值。
- props：is-submitting：提交中的狀態，避免重複送出。
- emit：submit(任務建立資料)：送出可建立任務的表單資料，不包含 coupleId 與 createdBy。

## 4. CSS 描述

- 元件主要使用 TailwindCSS 類別呈現表單、欄位與按鈕。
- Vant Popup 與 Picker 透過 app 語意變數設定背景、文字與確認按鈕色彩。
- 截止時間面板使用月份、日期、小時與分鐘四欄，年份由確認邏輯自動補入。
</spec>
