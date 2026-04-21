<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useErrorToast } from '@/composables/useErrorToast'
import MobileAppShell from '@/components/MobileAppShell.vue'
import { useAuthStore } from '@/pinia/auth'
import { useCoupleStore } from '@/pinia/couple'
import { useNotificationsStore } from '@/pinia/notifications'
import { usePointsStore } from '@/pinia/points'
import { useRewardsStore } from '@/pinia/rewards'
import { useTasksStore } from '@/pinia/tasks'
import { useUserStore } from '@/pinia/user'
import type { NotificationType } from '@/views/notifications/types/interface'
import type { PointLogType } from '@/views/points/types/interface'
import type { RedemptionStatus } from '@/views/rewards/types/interface'
import type { Task } from '@/views/tasks/types/interface'
import HomeActivityFeedCard from './components/HomeActivityFeedCard.vue'
import HomeHeader from './components/HomeHeader.vue'
import HomeHeroCard from './components/HomeHeroCard.vue'
import HomeTaskPanel from './components/HomeTaskPanel.vue'
import type {
  HomeActivityItem,
  HomeDashboardIconName,
  HomeDashboardRouteName,
  HomeHeroStatItem,
  HomePanelAction,
  HomePanelMetric,
  HomeTaskItem,
} from './type/interface'

const authStore = useAuthStore()
const coupleStore = useCoupleStore()
const notificationsStore = useNotificationsStore()
const pointsStore = usePointsStore()
const rewardsStore = useRewardsStore()
const tasksStore = useTasksStore()
const userStore = useUserStore()
const router = useRouter()

useErrorToast(() => authStore.errorMessage)
useErrorToast(() => notificationsStore.errorMessage)
useErrorToast(() => pointsStore.errorMessage)
useErrorToast(() => rewardsStore.errorMessage)
useErrorToast(() => tasksStore.errorMessage)

const userName = computed(() => userStore.profile?.displayName || 'TwoDo User')
const currentUid = computed(() => userStore.profile?.uid ?? '')
const currentPoints = computed(() => userStore.profile?.points ?? 0)
const pendingAssignedTasks = computed(() =>
  tasksStore.tasks.filter(
    (task) => task.assignedTo === currentUid.value && task.status === 'pending',
  ),
)
const waitingConfirmTasks = computed(() =>
  tasksStore.tasks.filter(
    (task) =>
      task.createdBy === currentUid.value &&
      task.status === 'completed_pending_confirm',
  ),
)
const redeemableRewardsCount = computed(() =>
  rewardsStore.rewards.filter((reward) => {
    if (!reward.isActive || reward.createdBy === currentUid.value) {
      return false
    }

    return currentPoints.value >= reward.cost
  }).length,
)
const recentAssignedTasks = computed(() => pendingAssignedTasks.value.slice(0, 3))
const recentWaitingConfirmTasks = computed(() =>
  waitingConfirmTasks.value.slice(0, 3),
)
const coupleDescription = computed(() => {
  if (coupleStore.getIsPaired) {
    return '已完成配對，可查看待辦、積分與活動。'
  }

  if (coupleStore.currentCoupleId) {
    return '配對資料同步中，完成後會顯示任務與獎勵。'
  }

  return '完成配對後，任務、獎勵、通知與點數會集中在這裡。'
})
const heroTitle = computed(() => {
  if (!coupleStore.getIsPaired) {
    return '先完成配對，開始共享任務'
  }

  if (waitingConfirmTasks.value.length) {
    return `有 ${waitingConfirmTasks.value.length} 件任務等你確認`
  }

  if (pendingAssignedTasks.value.length) {
    return `今天有 ${pendingAssignedTasks.value.length} 件待辦`
  }

  return '今天沒有待處理任務'
})

const formatDateTime = (value: Date) =>
  new Intl.DateTimeFormat('zh-TW', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value)

const resolveTaskMeta = (task: Task) => {
  if (task.dueDate) {
    return `截止 ${formatDateTime(task.dueDate)}`
  }

  return `${task.points} 點任務`
}

const goTo = async (routeName: HomeDashboardRouteName) => {
  await router.push({ name: routeName })
}

const handleSignOut = async () => {
  try {
    await authStore.signOutUser()
    await router.push({ name: 'login' })
  } catch {
    // The store already exposes a user-facing error message.
  }
}

const notificationTypeIconMap: Record<NotificationType, HomeDashboardIconName> = {
  new_task: 'tasks',
  reward_redeemed: 'gift',
  task_completed_pending_confirm: 'shield-check',
  task_confirmed: 'points',
}

const pointLogTypeIconMap: Record<PointLogType, HomeDashboardIconName> = {
  manual_adjust: 'activity',
  reward_redeem: 'gift',
  task_reward: 'points',
}

const redemptionStatusLabelMap: Record<RedemptionStatus, string> = {
  cancelled: '已取消',
  completed: '已完成',
  pending: '待處理',
}

const heroStats = computed<HomeHeroStatItem[]>(() => [
  {
    icon: 'points',
    label: '目前點數',
    value: currentPoints.value,
  },
  {
    icon: 'tasks',
    label: '指派給我',
    value: pendingAssignedTasks.value.length,
  },
  {
    icon: 'shield-check',
    label: '待我確認',
    value: waitingConfirmTasks.value.length,
  },
  {
    icon: 'bell',
    label: '未讀通知',
    value: notificationsStore.getUnreadCount,
  },
])

const assignedTaskItems = computed<HomeTaskItem[]>(() =>
  recentAssignedTasks.value.map((task) => ({
    badge: `${task.points} 點`,
    badgeTone: 'accent',
    description: task.description || resolveTaskMeta(task),
    id: task.id,
    title: task.title,
  })),
)

const waitingConfirmTaskItems = computed<HomeTaskItem[]>(() =>
  recentWaitingConfirmTasks.value.map((task) => ({
    badge: '確認',
    badgeTone: 'success',
    description: task.completedAt
      ? `完成於 ${formatDateTime(task.completedAt)}`
      : '等待確認',
    id: task.id,
    title: task.title,
  })),
)

const rewardMetrics = computed<HomePanelMetric[]>(() => [
  {
    label: '可兌換獎勵',
    value: redeemableRewardsCount.value,
  },
  {
    label: '最近兌換',
    value: rewardsStore.getRecentRedemptions.length,
  },
])

const tasksPanelAction: HomePanelAction = {
  icon: 'add',
  label: '前往任務頁',
  routeName: 'tasks',
}

const recentActivities = computed<HomeActivityItem[]>(() => {
  const notificationActivities = notificationsStore.notifications
    .slice(0, 4)
    .map((notification) => ({
      createdAt: notification.createdAt,
      description: notification.message,
      icon: notificationTypeIconMap[notification.type],
      id: `notification-${notification.id}`,
      label: notification.title,
      timestampLabel: formatDateTime(notification.createdAt),
    }))

  const pointActivities = pointsStore.pointLogs.slice(0, 4).map((pointLog) => ({
    createdAt: pointLog.createdAt,
    description: pointLog.taskTitle
      ? `任務「${pointLog.taskTitle}」已更新 ${pointLog.points > 0 ? '+' : ''}${pointLog.points} 點`
      : pointLog.rewardTitle
        ? `獎勵「${pointLog.rewardTitle}」已變動 ${pointLog.points > 0 ? '+' : ''}${pointLog.points} 點`
        : `點數變動 ${pointLog.points > 0 ? '+' : ''}${pointLog.points}`,
    icon: pointLogTypeIconMap[pointLog.type],
    id: `point-${pointLog.id}`,
    label:
      pointLog.type === 'task_reward'
        ? '積分入帳'
        : pointLog.type === 'reward_redeem'
          ? '獎勵扣點'
          : '手動調整',
    timestampLabel: formatDateTime(pointLog.createdAt),
  }))

  const redemptionActivities = rewardsStore.getRecentRedemptions
    .slice(0, 4)
    .map((redemption) => ({
      createdAt: redemption.createdAt,
      description: `${redemption.rewardTitle || '未命名獎勵'}，${redemption.cost} 點，${redemptionStatusLabelMap[redemption.status]}`,
      icon: 'gift' as const,
      id: `redemption-${redemption.id}`,
      label:
        redemption.redeemedBy === currentUid.value
          ? '我兌換了獎勵'
          : '另一半兌換了獎勵',
      timestampLabel: formatDateTime(redemption.createdAt),
    }))

  return [
    ...notificationActivities,
    ...pointActivities,
    ...redemptionActivities,
  ]
    .sort(
      (leftItem, rightItem) =>
        rightItem.createdAt.getTime() - leftItem.createdAt.getTime(),
    )
    .slice(0, 6)
})

watch(
  () => ({
    coupleId: userStore.profile?.coupleId ?? '',
    uid: userStore.profile?.uid ?? '',
  }),
  ({ coupleId, uid }) => {
    if (!coupleId || !uid) {
      notificationsStore.reset()
      pointsStore.reset()
      rewardsStore.reset()
      tasksStore.reset()
      return
    }

    void notificationsStore.syncNotifications(uid, coupleId)
    void pointsStore.syncPointLogs(uid, coupleId)
    void rewardsStore.syncRewards(coupleId)
    void tasksStore.syncTasks(coupleId)
  },
  { immediate: true },
)
</script>

<template>
  <MobileAppShell>
    <HomeHeader
      :user-name="userName"
      summary="今天要處理的事、最近活動和提醒都在這裡。"
      @sign-out="handleSignOut"
    />

    <section class="flex-1 space-y-[16px] px-[20px] pb-[24px] sm:px-[28px]">
      <HomeHeroCard
        :description="coupleDescription"
        :stats="heroStats"
        :title="heroTitle"
      />

      <section class="grid gap-[16px] lg:grid-cols-2">
        <HomeTaskPanel
          :action="tasksPanelAction"
          :items="assignedTaskItems"
          :empty-state="{
            title: '今天沒有待辦',
            description: '對方指派的任務會在這裡。',
          }"
          caption="先把今天要做的事情看完，再決定要不要切頁。"
          eyebrow="今日待辦"
          icon="tasks"
          title="指派給我的任務"
          @navigate="goTo"
        />

        <HomeTaskPanel
          :items="waitingConfirmTaskItems"
          :metrics="rewardMetrics"
          :empty-state="{
            title: '沒有待確認項目',
            description: '對方完成後會提醒你確認。',
          }"
          caption="這裡只保留需要你回覆的項目。"
          eyebrow="待我確認"
          icon="shield-check"
          title="已完成待確認"
        />
      </section>

      <HomeActivityFeedCard :activities="recentActivities" />
    </section>
  </MobileAppShell>
</template>
