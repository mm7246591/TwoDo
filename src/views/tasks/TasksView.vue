<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import TaskComposerCard from '@/components/task/TaskComposerCard.vue'
import TaskListCard from '@/components/task/TaskListCard.vue'
import { useErrorToast } from '@/composables/useErrorToast'
import MobileAppShell from '@/components/MobileAppShell.vue'
import { useTasksStore } from '@/pinia/tasks'
import { useUserStore } from '@/pinia/user'
import { getUserProfile } from '@/services/userService'
import { showSuccessMessage } from '@/services/uiFeedback'
import type { CreateTaskInput } from '@/pinia/tasks/types/interface'
import type { Task } from '@/views/tasks/types/interface'

const userStore = useUserStore()
const tasksStore = useTasksStore()
const partnerDisplayName = ref('')

useErrorToast(() => tasksStore.errorMessage)

const canUseTasks = computed(() => Boolean(userStore.profile?.coupleId && userStore.profile?.partnerUid && userStore.profile?.uid))
const currentUid = computed(() => userStore.profile?.uid ?? '')
const myAssignedTasks = computed(() => tasksStore.tasks.filter((task) => task.assignedTo === currentUid.value && task.status === 'pending'))
const myCreatedTasks = computed(() => tasksStore.tasks.filter((task) => task.createdBy === currentUid.value && task.status === 'pending'))
const waitingConfirmTasks = computed(() => tasksStore.getCompletedPendingConfirmTasks.filter((task) => task.createdBy === currentUid.value))
const confirmedTasks = computed(() => tasksStore.getConfirmedTasks)
const cancelledTasks = computed(() => tasksStore.getCancelledTasks)
const assigneeLabel = computed(() => partnerDisplayName.value || '另一半')

watch(
  () => userStore.profile?.coupleId,
  (coupleId) => {
    if (!coupleId) {
      tasksStore.reset()
      return
    }

    void tasksStore.syncTasks(coupleId)
  },
  { immediate: true },
)

watch(
  () => userStore.profile?.partnerUid ?? '',
  async (partnerUid) => {
    partnerDisplayName.value = ''

    if (!partnerUid) {
      return
    }

    try {
      const partnerProfile = await getUserProfile(partnerUid)
      partnerDisplayName.value = partnerProfile?.displayName?.trim() || ''
    } catch {
      partnerDisplayName.value = ''
    }
  },
  { immediate: true },
)

const handleCreateTask = async (payload: Omit<CreateTaskInput, 'coupleId' | 'createdBy'>) => {
  if (!userStore.profile?.uid || !userStore.profile?.coupleId) {
    return
  }

  try {
    await tasksStore.createNewTask({
      ...payload,
      coupleId: userStore.profile.coupleId,
      createdBy: userStore.profile.uid,
    })
  } catch {
    return
  }

  showSuccessMessage('任務已建立')
}

const handleCompleteTask = async (task: Task) => {
  if (!userStore.profile?.uid) {
    return
  }

  try {
    await tasksStore.markTaskCompleted(task, userStore.profile.uid)
  } catch {
    return
  }

  showSuccessMessage('任務已標記完成')
}

const handleConfirmTask = async (task: Task) => {
  if (!userStore.profile?.uid) {
    return
  }

  try {
    await tasksStore.confirmTaskCompletion(task, userStore.profile.uid)
  } catch {
    return
  }

  showSuccessMessage('任務已確認並加分')
}

const handleCancelTask = async (task: Task) => {
  if (!userStore.profile?.uid) {
    return
  }

  try {
    await tasksStore.cancelExistingTask(task, userStore.profile.uid)
  } catch {
    return
  }

  showSuccessMessage('任務已取消')
}
</script>

<template>
  <MobileAppShell>
    <header class="space-y-[20px] px-[20px] pb-[24px] pt-[32px] sm:px-[28px] sm:pt-[40px]">
      <div class="flex items-start justify-between gap-[12px]">
        <div class="min-w-0">
          <div class="app-chip">任務看板</div>
          <h1 class="app-page-title mt-[14px] max-w-[11ch]">
            兩人共享任務板
          </h1>
        </div>
      </div>

      <p class="app-page-summary">指派、完成、確認的流程會在這裡完整留痕。</p>
    </header>

    <section class="flex-1 space-y-[16px] px-[20px] pb-[24px] sm:px-[28px]">
      <section v-if="!canUseTasks" class="app-card px-[20px] py-[20px]">
        <p class="app-label">目前狀態</p>
        <p class="app-text-strong mt-[12px] text-[24px] font-semibold tracking-[-0.04em]">
          還不能建立任務
        </p>
        <p class="app-text-muted mt-[12px] text-[14px] leading-[24px]">
          完成配對後才能指派任務。
        </p>
      </section>

      <TaskComposerCard
        v-else
        :assignee-label="assigneeLabel"
        :default-assigned-to="userStore.profile?.partnerUid ?? ''"
        :is-submitting="tasksStore.isSubmitting"
        @submit="handleCreateTask"
      />

      <section class="grid grid-cols-2 gap-[16px]">
        <article class="app-card px-[16px] py-[16px]">
          <p class="app-label">指派給我的</p>
          <p class="app-metric-value mt-[8px]">{{ myAssignedTasks.length }}</p>
        </article>

        <article class="app-card-muted px-[16px] py-[16px]">
          <p class="app-label">待我確認</p>
          <p class="app-metric-value mt-[8px]">{{ waitingConfirmTasks.length }}</p>
        </article>
      </section>

      <section class="app-card px-[20px] py-[20px]">
        <div class="flex flex-col gap-[14px] sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <p class="app-label">指派給我的</p>
            <p class="app-card-title mt-[8px]">我要完成的任務</p>
            <p class="app-card-caption mt-[8px]">
              左滑可完成或取消。
            </p>
          </div>

          <span
            :class="[
              'app-meta-pill',
              tasksStore.isLoading ? 'app-meta-pill-accent' : 'app-meta-pill-success',
            ]"
          >
            {{ tasksStore.isLoading ? '資料同步中' : '資料已同步' }}
          </span>
        </div>

        <div class="mt-[20px] space-y-[16px]">
          <TaskListCard
            v-for="task in myAssignedTasks"
            :key="task.id"
            :current-uid="currentUid"
            :is-submitting="tasksStore.isSubmitting"
            :task="task"
            @cancel="handleCancelTask"
            @complete="handleCompleteTask"
            @confirm="handleConfirmTask"
          />

          <AppEmptyState
            v-if="!myAssignedTasks.length"
            title="目前沒有待辦"
            description="對方指派給你的任務會出現在這裡。"
          />
        </div>
      </section>

      <section class="app-card px-[20px] py-[20px]">
        <div class="flex flex-col gap-[14px] sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <p class="app-label">等待我確認</p>
            <p class="app-card-title mt-[8px]">等你確認的任務</p>
            <p class="app-card-caption mt-[8px]">
              左滑可確認或取消。
            </p>
          </div>

          <span class="app-meta-pill app-meta-pill-strong">
            {{ waitingConfirmTasks.length }} 件待處理
          </span>
        </div>

        <div class="mt-[20px] space-y-[16px]">
          <TaskListCard
            v-for="task in waitingConfirmTasks"
            :key="task.id"
            :current-uid="currentUid"
            :is-submitting="tasksStore.isSubmitting"
            :task="task"
            @cancel="handleCancelTask"
            @complete="handleCompleteTask"
            @confirm="handleConfirmTask"
          />

          <AppEmptyState
            v-if="!waitingConfirmTasks.length"
            title="沒有待確認任務"
            description="對方完成後會在這裡待確認。"
          />
        </div>
      </section>

      <section class="app-card px-[20px] py-[20px]">
        <div class="flex flex-col gap-[14px] sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <p class="app-label">我指派出去的</p>
            <p class="app-card-title mt-[8px]">對方還沒完成</p>
            <p class="app-card-caption mt-[8px]">
              左滑可取消。
            </p>
          </div>

          <span class="app-meta-pill app-meta-pill-strong">
            {{ myCreatedTasks.length }} 件進行中
          </span>
        </div>

        <div class="mt-[20px] space-y-[16px]">
          <TaskListCard
            v-for="task in myCreatedTasks"
            :key="task.id"
            :current-uid="currentUid"
            :is-submitting="tasksStore.isSubmitting"
            :task="task"
            @cancel="handleCancelTask"
            @complete="handleCompleteTask"
            @confirm="handleConfirmTask"
          />

          <AppEmptyState
            v-if="!myCreatedTasks.length"
            title="沒有進行中的指派"
            description="你建立給對方的任務會出現在這裡。"
          />
        </div>
      </section>

      <section class="grid grid-cols-2 gap-[16px]">
        <article class="app-card px-[16px] py-[16px]">
          <p class="app-label">已確認完成</p>
          <p class="app-metric-value mt-[8px]">{{ confirmedTasks.length }}</p>
        </article>

        <article class="app-card-muted px-[16px] py-[16px]">
          <p class="app-label">已取消</p>
          <p class="app-metric-value mt-[8px]">{{ cancelledTasks.length }}</p>
        </article>
      </section>

      <section class="app-card px-[20px] py-[20px]">
        <div class="flex flex-col gap-[14px] sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <p class="app-label">已確認完成</p>
            <p class="app-card-title mt-[8px]">已完成的任務紀錄</p>
          </div>

          <span class="app-meta-pill app-meta-pill-success">
            {{ confirmedTasks.length }} 筆紀錄
          </span>
        </div>

        <div class="mt-[20px] space-y-[16px]">
          <TaskListCard
            v-for="task in confirmedTasks"
            :key="task.id"
            :current-uid="currentUid"
            :is-submitting="tasksStore.isSubmitting"
            :task="task"
            @cancel="handleCancelTask"
            @complete="handleCompleteTask"
            @confirm="handleConfirmTask"
          />

          <AppEmptyState
            v-if="!confirmedTasks.length"
            title="還沒有完成紀錄"
            description="確認完成後會保留在這裡。"
          />
        </div>
      </section>

      <section class="app-card px-[20px] py-[20px]">
        <div class="flex flex-col gap-[14px] sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <p class="app-label">已取消</p>
            <p class="app-card-title mt-[8px]">已取消的任務紀錄</p>
          </div>

          <span class="app-meta-pill app-meta-pill-strong">
            {{ cancelledTasks.length }} 筆紀錄
          </span>
        </div>

        <div class="mt-[20px] space-y-[16px]">
          <TaskListCard
            v-for="task in cancelledTasks"
            :key="task.id"
            :current-uid="currentUid"
            :is-submitting="tasksStore.isSubmitting"
            :task="task"
            @cancel="handleCancelTask"
            @complete="handleCompleteTask"
            @confirm="handleConfirmTask"
          />

          <AppEmptyState
            v-if="!cancelledTasks.length"
            title="沒有取消紀錄"
            description="被取消的任務會集中保留在這裡。"
          />
        </div>
      </section>
    </section>
  </MobileAppShell>
</template>
