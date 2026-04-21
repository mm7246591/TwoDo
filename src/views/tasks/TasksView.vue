<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
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

const router = useRouter()
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

const goHome = async () => {
  await router.push({ name: 'home' })
}

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
          <h1 class="app-text-strong mt-[16px] max-w-[12ch] text-[34px] font-semibold leading-[1.04] tracking-[-0.045em]">
            兩人共享任務板
          </h1>
        </div>

        <button class="app-ghost-button shrink-0 px-[16px] py-[12px] text-[14px]" type="button" @click="goHome">
          返回首頁
        </button>
      </div>

      <p class="app-text-muted max-w-[34ch] text-[14px] leading-[24px]">
        互相指派待辦、完成後等待確認，確認通過就會自動加分。
      </p>
    </header>

    <section class="flex-1 space-y-[16px] px-[20px] pb-[24px] sm:px-[28px]">
      <section v-if="!canUseTasks" class="app-card px-[20px] py-[20px]">
        <p class="app-label">目前狀態</p>
        <p class="app-text-strong mt-[12px] text-[24px] font-semibold tracking-[-0.04em]">
          還不能建立任務
        </p>
        <p class="app-text-muted mt-[12px] text-[14px] leading-[24px]">
          需要先完成配對，才能把任務指派給另一半。
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
          <p class="app-text-strong mt-[8px] text-[30px] font-semibold">{{ myAssignedTasks.length }}</p>
        </article>

        <article class="app-card-muted px-[16px] py-[16px]">
          <p class="app-label">待我確認</p>
          <p class="app-text-strong mt-[8px] text-[30px] font-semibold">{{ waitingConfirmTasks.length }}</p>
        </article>
      </section>

      <section class="app-card px-[20px] py-[20px]">
        <div class="flex items-center justify-between gap-[12px]">
          <div>
            <p class="app-label">指派給我的</p>
            <p class="app-text-strong mt-[8px] text-[24px] font-semibold tracking-[-0.04em]">
              我現在要完成的任務
            </p>
          </div>

          <div class="app-accent-panel px-[12px] py-[8px] text-right">
            <p class="app-kicker">同步狀態</p>
            <p class="app-text-strong mt-[4px] text-[14px] font-semibold">
              {{ tasksStore.isLoading ? '讀取中' : '已同步' }}
            </p>
          </div>
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
        <div class="flex items-center justify-between gap-[12px]">
          <div>
            <p class="app-label">等待我確認</p>
            <p class="app-text-strong mt-[8px] text-[24px] font-semibold tracking-[-0.04em]">
              已完成待確認
            </p>
          </div>

          <div class="app-accent-panel px-[12px] py-[8px] text-right">
            <p class="app-kicker">需要動作</p>
            <p class="app-text-strong mt-[4px] text-[14px] font-semibold">
              {{ waitingConfirmTasks.length }}
            </p>
          </div>
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
            description="對方完成你建立的任務後，會在這裡等待你確認。"
          />
        </div>
      </section>

      <section class="app-card px-[20px] py-[20px]">
        <div class="flex items-center justify-between gap-[12px]">
          <div>
            <p class="app-label">我指派出去的</p>
            <p class="app-text-strong mt-[8px] text-[24px] font-semibold tracking-[-0.04em]">
              尚未完成的任務
            </p>
          </div>

          <div class="app-accent-panel px-[12px] py-[8px] text-right">
            <p class="app-kicker">待完成</p>
            <p class="app-text-strong mt-[4px] text-[14px] font-semibold">
              {{ myCreatedTasks.length }}
            </p>
          </div>
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
          <p class="app-text-strong mt-[8px] text-[30px] font-semibold">{{ confirmedTasks.length }}</p>
        </article>

        <article class="app-card-muted px-[16px] py-[16px]">
          <p class="app-label">已取消</p>
          <p class="app-text-strong mt-[8px] text-[30px] font-semibold">{{ cancelledTasks.length }}</p>
        </article>
      </section>

      <section class="app-card px-[20px] py-[20px]">
        <div class="flex items-center justify-between gap-[12px]">
          <div>
            <p class="app-label">已確認完成</p>
            <p class="app-text-strong mt-[8px] text-[24px] font-semibold tracking-[-0.04em]">
              已完成的任務紀錄
            </p>
          </div>

          <div class="app-accent-panel px-[12px] py-[8px] text-right">
            <p class="app-kicker">完成</p>
            <p class="app-text-strong mt-[4px] text-[14px] font-semibold">
              {{ confirmedTasks.length }}
            </p>
          </div>
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
            description="確認完成後的任務會保留在這裡，方便回顧。"
          />
        </div>
      </section>

      <section class="app-card px-[20px] py-[20px]">
        <div class="flex items-center justify-between gap-[12px]">
          <div>
            <p class="app-label">已取消</p>
            <p class="app-text-strong mt-[8px] text-[24px] font-semibold tracking-[-0.04em]">
              已取消的任務紀錄
            </p>
          </div>

          <div class="app-accent-panel px-[12px] py-[8px] text-right">
            <p class="app-kicker">取消</p>
            <p class="app-text-strong mt-[4px] text-[14px] font-semibold">
              {{ cancelledTasks.length }}
            </p>
          </div>
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
