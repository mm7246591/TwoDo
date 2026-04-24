<script setup lang="ts">
import MobileAppShell from "@/components/MobileAppShell.vue";
import Header from "@/components/home/Header.vue";
import PointCard from "@/components/home/PointCard.vue";
import TaskPanel from "@/components/home/TaskPanel.vue";
import { useHomeDashboard } from "./composables/useHomeDashboard";

const {
  currentPoints,
  focusTaskItems,
  goTo,
  handleCompleteTask,
  handleConfirmTask,
  handleRemindTask,
  isSubmitting,
  tasksPanelAction,
  unreadCount,
  userName,
  userPhotoUrl,
  waitingConfirmTaskItems,
} = useHomeDashboard();
</script>

<template>
  <MobileAppShell>
    <Header
      :photo-url="userPhotoUrl"
      summary="今天也是美好的一天，一起加油。"
      :unread-count="unreadCount"
      :user-name="userName"
      @notifications="goTo('notifications')"
    />

    <section class="app-page-content grid flex-1 gap-[var(--app-space-24)]">
      <PointCard
        :current-points="currentPoints"
        :user-name="userName"
        :user-photo-url="userPhotoUrl"
        @redeem="goTo('rewards')"
      />

      <section class="grid gap-[var(--app-space-24)]">
        <TaskPanel
          :action="tasksPanelAction"
          :empty-state="{
            title: '現在很輕鬆',
            description: '要不要為夥伴建立一個小驚喜？',
          }"
          empty-variant="focus"
          :is-submitting="isSubmitting"
          :items="focusTaskItems"
          icon="tasks"
          title="今日焦點"
          @complete="handleCompleteTask"
          @confirm="handleConfirmTask"
          @navigate="goTo"
          @remind="handleRemindTask"
        />

        <TaskPanel
          :empty-state="{
            description: '夥伴還在努力中，等他完成任務後再來給個大大的擁抱吧！',
          }"
          empty-variant="confirmation"
          :is-submitting="isSubmitting"
          :items="waitingConfirmTaskItems"
          icon="shield-check"
          title="需要你的肯定"
          @complete="handleCompleteTask"
          @confirm="handleConfirmTask"
          @navigate="goTo"
          @remind="handleRemindTask"
        />
      </section>
    </section>
  </MobileAppShell>
</template>
