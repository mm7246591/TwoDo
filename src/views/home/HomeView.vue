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
    <header class="grid gap-[20px] px-[20px] pb-[20px] pt-[32px] sm:px-[28px] sm:pt-[40px]">
      <div class="grid gap-[8px]">
        <h1
          class="m-[0px] text-[32px] font-[800] leading-[1.18] tracking-[0px] text-[var(--app-text-strong)]">
          我們的日常
        </h1>
        <p class="m-[0px] max-w-[32ch] text-[16px] leading-[1.65] text-[var(--app-text-muted)]">
          今天也是美好的一天，一起加油。
        </p>
      </div>
    </header>

    <section class="px-[20px] pb-[24px] sm:px-[28px] grid flex-1 gap-[24px]">
      <PointCard :current-points="currentPoints" :user-name="userName" :user-photo-url="userPhotoUrl"
        @redeem="goTo('rewards')" />

      <section class="grid gap-[24px]">
        <TaskPanel :action="tasksPanelAction" :empty-state="{
          title: '目前沒有焦點任務',
          description: '新增一個任務，讓今天更有節奏。',
        }" empty-variant="focus" :is-submitting="isSubmitting" :items="focusTaskItems" icon="tasks" title="待辦事項"
          @complete="handleCompleteTask" @confirm="handleConfirmTask" @navigate="goTo" @remind="handleRemindTask" />

        <TaskPanel :empty-state="{
          description: '夥伴還在努力中，等他完成任務後再來給個大大的擁抱吧！',
        }" empty-variant="confirmation" :is-submitting="isSubmitting" :items="waitingConfirmTaskItems"
          icon="shield-check" title="等待確認" @complete="handleCompleteTask" @confirm="handleConfirmTask" @navigate="goTo"
          @remind="handleRemindTask" />
      </section>
    </section>
  </MobileAppShell>
</template>




