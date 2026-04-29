<script setup lang="ts">
import TaskForm from "@/components/task/TaskForm.vue";

const handleSubmit = () => {
  // 測試頁只用來檢查表單互動，不送出資料。
};
</script>

<template>
  <main class="min-h-dvh bg-[var(--app-background)] px-[20px] py-[32px]">
    <TaskForm
      assignee-label="測試夥伴"
      current-uid="debug-user"
      default-assigned-to="debug-partner"
      :is-submitting="false"
      @submit="handleSubmit"
    />
  </main>
</template>
