type TaskStatus =
  | 'pending'
  | 'completed_pending_confirm'
  | 'confirmed'
  | 'cancelled'
  | 'rejected'

type TaskAssignmentType = 'user' | 'couple'

type TaskAssigneeOption = "me" | "partner" | "couple";

interface TaskAssigneePickerOption {
  disabled?: boolean;
  text: string;
  value: TaskAssigneeOption;
}

/** 任務截止時間簡化選單的單欄資料。 */
interface TaskDueDatePickerColumn {
  defaultIndex: number;
  values: string[];
}

/** 任務截止時間簡化選單目前選取的月日時間。 */
interface TaskDueDatePickerSelection {
  day: number;
  hour: number;
  minute: number;
  month: number;
}

interface Task {
  id: string
  coupleId: string
  title: string
  description?: string
  points: number
  status: TaskStatus
  assignmentType: TaskAssignmentType
  assignedTo: string | null
  participantUids: string[]
  completedByUids: string[]
  confirmedByUids: string[]
  createdBy: string
  dueDate?: Date | null
  completedAt?: Date | null
  confirmedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

interface TaskComposerForm {
  assignedTo: string | null;
  assignmentType: TaskAssignmentType;
  description: string;
  dueDate: string;
  points: number;
  title: string;
}

export type {
  Task,
  TaskAssigneeOption,
  TaskAssigneePickerOption,
  TaskAssignmentType,
  TaskStatus,
  TaskComposerForm,
  TaskDueDatePickerColumn,
  TaskDueDatePickerSelection,
}
