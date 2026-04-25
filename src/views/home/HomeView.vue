<script setup lang="ts">
import MobileAppShell from "@/components/common/MobileAppShell.vue";
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
  userName,
  userPhotoUrl,
  waitingConfirmTaskItems,
} = useHomeDashboard();
</script>

<template>
  <MobileAppShell>
    <header class="app-page-header home-page-header">
      <div class="grid gap-[var(--app-space-8)]">
        <h1
          class="m-[0px] text-[length:var(--app-type-32)] font-[800] leading-[1.18] tracking-[0px] text-[var(--app-text-strong)]">
          我們的日常
        </h1>
        <p class="m-[0px] max-w-[32ch] text-[length:var(--app-type-16)] leading-[1.65] text-[var(--app-text-muted)]">
          今天也是美好的一天，一起加油。
        </p>
      </div>
    </header>

    <section class="app-page-content grid flex-1 gap-[var(--app-space-24)]">
      <PointCard :current-points="currentPoints" :user-name="userName" :user-photo-url="userPhotoUrl"
        @redeem="goTo('rewards')" />

      <section class="grid gap-[var(--app-space-24)]">
        <TaskPanel :action="tasksPanelAction" :empty-state="{
          title: '現在很輕鬆',
          description: '要不要為夥伴建立一個小驚喜？',
        }" empty-variant="focus" :is-submitting="isSubmitting" :items="focusTaskItems" icon="tasks" title="待辦事項"
          @complete="handleCompleteTask" @confirm="handleConfirmTask" @navigate="goTo" @remind="handleRemindTask" />

        <TaskPanel :empty-state="{
          description: '夥伴還在努力中，等他完成任務後再來給個大大的擁抱吧！',
        }" empty-variant="confirmation" :is-submitting="isSubmitting" :items="waitingConfirmTaskItems"
          icon="shield-check" title="待確認" @complete="handleCompleteTask" @confirm="handleConfirmTask" @navigate="goTo"
          @remind="handleRemindTask" />
      </section>
    </section>
  </MobileAppShell>
</template>

<style scoped>
.home-page-header {
  padding-bottom: var(--app-space-20);
}
</style>
