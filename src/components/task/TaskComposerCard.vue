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
  <section class="task-composer" aria-labelledby="task-composer-title">
    <div class="task-composer__intro">
      <p class="task-composer__eyebrow">Create Task</p>
      <h2 id="task-composer-title" class="task-composer__title">新冒險</h2>
      <p class="task-composer__subtitle">今天想計畫些什麼？</p>
    </div>

    <form class="task-composer__card" @submit.prevent="handleSubmit">
      <label class="task-composer__field">
        <span class="task-composer__label">冒險名稱</span>
        <input v-model="form.title" class="task-composer__input" type="text" placeholder="例如：週日的農夫市集"
          autocomplete="off" />
      </label>

      <label class="task-composer__field">
        <span class="task-composer__label">詳細內容（選填）</span>
        <textarea v-model="form.description" class="task-composer__input task-composer__textarea"
          placeholder="有什麼特別需要注意的事項嗎..." rows="3" />
      </label>

      <div class="task-composer__field">
        <span class="task-composer__label">這件事誰來做？</span>
        <div class="task-composer__chips" role="group" aria-label="任務指派對象">
          <button class="task-composer__chip" :class="{ 'is-selected': getSelectedAssignee === 'me' }" type="button"
            :disabled="!currentUid" @click="selectAssignee('me')">
            我
          </button>
          <button class="task-composer__chip" :class="{ 'is-selected': getSelectedAssignee === 'partner' }"
            type="button" :disabled="!defaultAssignedTo" @click="selectAssignee('partner')">
            {{ getPartnerLabel }}
          </button>
          <button class="task-composer__chip" :class="{ 'is-selected': getSelectedAssignee === 'couple' }" type="button"
            @click="selectAssignee('couple')">
            我們
          </button>
        </div>
      </div>

      <section class="task-composer__reward" aria-labelledby="reward-title">
        <div class="task-composer__reward-head">
          <span id="reward-title" class="task-composer__reward-label">
            <span class="material-symbols-outlined fill" aria-hidden="true">
              stars
            </span>
            獎勵點數
          </span>
          <strong class="task-composer__points">+{{ form.points }}</strong>
        </div>
        <input v-model.number="form.points" class="task-composer__range" type="range" min="0" max="1000" step="50" />
        <div class="task-composer__range-scale" aria-hidden="true">
          <span>0</span>
          <span>1000</span>
        </div>
      </section>

      <div class="task-composer__due-date">
        <button class="task-composer__date-button" type="button" @click="openDueDatePicker">
          <span class="material-symbols-outlined" aria-hidden="true">event</span>
          <span>{{ getDueDateLabel }}</span>
        </button>
        <button v-if="form.dueDate" class="task-composer__date-clear" type="button" aria-label="清除日期"
          @click="clearDueDate">
          <span class="material-symbols-outlined" aria-hidden="true">close</span>
        </button>
      </div>

      <button class="task-composer__submit" type="submit" :disabled="!canSubmit">
        <span class="material-symbols-outlined fill" aria-hidden="true">
          favorite
        </span>
        {{ isSubmitting ? "建立中..." : "建立冒險" }}
      </button>
    </form>

    <Popup v-model:show="showDueDatePicker" position="bottom" round safe-area-inset-bottom teleport="body">
      <DatePicker v-model="datePickerValue" title="截止日期" cancel-button-text="取消" confirm-button-text="確認"
        :min-date="minDueDate" :max-date="new Date(2035, 11, 31)" @cancel="showDueDatePicker = false"
        @confirm="handleConfirmDueDate" />
    </Popup>
  </section>
</template>

<style scoped>
.task-composer {
  --create-background: #fff8f6;
  --create-surface: #ffffff;
  --create-surface-low: #fff1ec;
  --create-surface-container: #f9ebe7;
  --create-surface-variant: #ede0db;
  --create-outline: #87726d;
  --create-outline-variant: #dac1bb;
  --create-primary: #944835;
  --create-primary-container: #ff9e85;
  --create-secondary-container: #b3efd8;
  --create-on-secondary-container: #356e5c;
  --create-on-surface: #211a18;
  --create-on-surface-variant: #54433e;
  display: grid;
  gap: 1.5rem;
  color: var(--create-on-surface);
}

.task-composer__intro {
  display: grid;
  gap: 0.25rem;
  padding: 0 0.25rem;
}

.task-composer__eyebrow,
.task-composer__title,
.task-composer__subtitle,
.task-composer__label,
.task-composer__points,
.task-composer__reward-label,
.task-composer__range-scale {
  margin: 0;
}

.task-composer__eyebrow {
  color: var(--create-primary);
  font-size: var(--app-type-12);
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.task-composer__title {
  color: var(--create-on-surface);
  font-size: var(--app-type-32);
  font-weight: 800;
  line-height: 1.18;
}

.task-composer__subtitle {
  color: var(--create-on-surface-variant);
  font-size: var(--app-type-16);
  line-height: 1.5;
}

.task-composer__card {
  display: grid;
  gap: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.86);
  border-radius: 1.5rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 253, 251, 0.94)),
    var(--create-surface);
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(148, 72, 53, 0.08);
}

.task-composer__field {
  display: grid;
  gap: 0.5rem;
}

.task-composer__label {
  padding-left: 0.5rem;
  color: var(--create-on-surface-variant);
  font-size: var(--app-type-15);
  font-weight: 700;
  line-height: 1.35;
}

.task-composer__input {
  width: 100%;
  border: 0;
  border-radius: 0.9rem;
  background: var(--create-surface-variant);
  padding: 1rem 0.75rem;
  color: var(--create-on-surface);
  font-size: var(--app-type-16);
  line-height: 1.5;
  outline: none;
  transition: background-color 220ms ease, box-shadow 220ms ease;
}

.task-composer__input::placeholder {
  color: var(--create-outline);
}

.task-composer__input:focus {
  background: var(--create-surface);
  box-shadow:
    0 0 0 2px var(--create-primary-container),
    0 4px 16px rgba(255, 158, 133, 0.3);
}

.task-composer__textarea {
  min-height: 7rem;
  resize: none;
}

.task-composer__chips {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.task-composer__chip {
  min-width: 0;
  border: 0;
  border-radius: 999px;
  background: var(--create-surface-variant);
  padding: 0.75rem 0.6rem;
  color: var(--create-on-surface-variant);
  font-size: var(--app-type-15);
  font-weight: 800;
  transition: background-color 180ms ease, color 180ms ease, transform 180ms ease, box-shadow 180ms ease;
}

.task-composer__chip:not(:disabled):active,
.task-composer__submit:not(:disabled):active {
  transform: scale(0.98);
}

.task-composer__chip.is-selected {
  background: var(--create-secondary-container);
  color: var(--create-on-secondary-container);
  box-shadow: 0 8px 18px rgba(47, 104, 87, 0.12);
}

.task-composer__chip:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.task-composer__reward {
  display: grid;
  gap: 0.75rem;
  border-radius: 1rem;
  background: var(--create-surface-container);
  padding: 1.25rem;
}

.task-composer__reward-head,
.task-composer__range-scale,
.task-composer__due-date {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.task-composer__reward-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--create-on-surface);
  font-size: var(--app-type-15);
  font-weight: 800;
}

.task-composer__reward-label .material-symbols-outlined {
  color: var(--create-primary);
  font-size: 1.25rem;
}

.task-composer__points {
  color: var(--create-primary);
  font-size: var(--app-type-24);
  font-weight: 800;
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
}

.task-composer__range {
  width: 100%;
  margin: 0.35rem 0 0;
  appearance: none;
  background: transparent;
}

.task-composer__range::-webkit-slider-runnable-track {
  height: 0.5rem;
  border-radius: 999px;
  background: var(--create-surface-variant);
}

.task-composer__range::-webkit-slider-thumb {
  width: 1.5rem;
  height: 1.5rem;
  margin-top: -0.5rem;
  appearance: none;
  border-radius: 999px;
  background: var(--create-primary);
  box-shadow: 0 2px 8px rgba(148, 72, 53, 0.3);
}

.task-composer__range::-moz-range-track {
  height: 0.5rem;
  border-radius: 999px;
  background: var(--create-surface-variant);
}

.task-composer__range::-moz-range-thumb {
  width: 1.5rem;
  height: 1.5rem;
  border: 0;
  border-radius: 999px;
  background: var(--create-primary);
  box-shadow: 0 2px 8px rgba(148, 72, 53, 0.3);
}

.task-composer__range-scale {
  color: var(--create-outline);
  font-size: var(--app-type-12);
  font-weight: 700;
}

.task-composer__date-button,
.task-composer__date-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  color: var(--create-on-surface-variant);
}

.task-composer__date-button {
  flex: 1;
  justify-content: flex-start;
  gap: 0.5rem;
  border-radius: 999px;
  background: var(--create-surface-low);
  padding: 0.75rem 1rem;
  font-size: var(--app-type-15);
  font-weight: 800;
}

.task-composer__date-clear {
  width: 2.75rem;
  border-radius: 999px;
  background: var(--create-surface-variant);
}

.task-composer__date-button .material-symbols-outlined,
.task-composer__date-clear .material-symbols-outlined {
  font-size: 1.25rem;
}

.task-composer__submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  border: 0;
  border-radius: 1.25rem;
  background: var(--create-primary);
  padding: 1.15rem 1rem;
  color: #ffffff;
  font-size: var(--app-type-15);
  font-weight: 800;
  box-shadow: 0 8px 24px rgba(148, 72, 53, 0.4);
  transition: transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
}

.task-composer__submit:hover:not(:disabled) {
  box-shadow: 0 12px 28px rgba(148, 72, 53, 0.5);
}

.task-composer__submit:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  box-shadow: none;
}

@media (min-width: 640px) {
  .task-composer__card {
    padding: 2rem;
  }
}
</style>
