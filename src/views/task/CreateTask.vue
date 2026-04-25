<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import AppEmptyState from "@/components/common/AppEmptyState.vue";
import TaskComposerCard from "@/components/task/TaskComposerCard.vue";
import TaskListCard from "@/components/task/TaskListCard.vue";
import MobileAppShell from "@/components/common/MobileAppShell.vue";
import { useTasksDashboard } from "./composables/useTasksDashboard";

const route = useRoute();

const {
  assigneeLabel,
  cancelledTasks,
  canUseTasks,
  confirmedTasks,
  currentUid,
  defaultAssignedTo,
  handleCancelTask,
  handleCompleteTask,
  handleConfirmTask,
  handleCreateTask,
  isSubmitting,
  myAssignedTasks,
  waitingConfirmTasks,
  waitingOtherTasks,
} = useTasksDashboard();

const isCreateRoute = computed(() => route.name === "task-create");
</script>

<template>
  <MobileAppShell>
    <template v-if="isCreateRoute">
      <header class="task-create-topbar">
        <div class="task-create-avatar" aria-hidden="true">
          <span class="material-symbols-outlined fill">person</span>
        </div>
        <h1 class="task-create-title">建立任務</h1>
        <RouterLink class="task-create-settings" :to="{ name: 'settings' }" aria-label="前往設定">
          <span class="material-symbols-outlined fill" aria-hidden="true">settings</span>
        </RouterLink>
      </header>

      <section class="app-page-content flex-1 tasks-create-page">
        <section v-if="!canUseTasks" class="task-pairing-card" aria-labelledby="task-pairing-title">
          <div class="task-pairing-visual" aria-hidden="true">
            <div class="task-pairing-map">
              <span class="task-pairing-bolt"></span>
              <span class="task-pairing-bubble task-pairing-bubble--heart">
                <span class="material-symbols-outlined fill">favorite</span>
              </span>
              <span class="task-pairing-bubble task-pairing-bubble--home">
                <span class="material-symbols-outlined fill">home</span>
              </span>
              <div class="task-pairing-visual-copy">
                <span>PARTNERSHIP</span>
                <strong>SAFE WORK</strong>
              </div>
            </div>
          </div>

          <div class="task-pairing-copy">
            <h2 id="task-pairing-title">共同生活需要兩個人一起開始</h2>
            <p>配對夥伴後，就能開始為彼此指派任務、累積點數囉！</p>
          </div>

          <RouterLink class="task-pairing-action" :to="{ name: 'pairing' }">
            <span class="material-symbols-outlined fill" aria-hidden="true">person_add</span>
            去邀請夥伴
          </RouterLink>

          <p class="task-pairing-status">
            <span aria-hidden="true"></span>
            等待你的另一半加入
          </p>
        </section>

        <TaskComposerCard v-else :assignee-label="assigneeLabel" :current-uid="currentUid"
          :default-assigned-to="defaultAssignedTo" :is-submitting="isSubmitting" @submit="handleCreateTask" />
      </section>
    </template>

    <template v-else>
      <header class="app-page-header tasks-page-header">
        <div class="app-page-header-row">
          <div class="min-w-[0px]">
            <h1 class="app-page-title mt-[12px]">一起完成小冒險</h1>
          </div>
        </div>

        <p class="app-page-summary">
          安排彼此的小任務，把日常變成可以一起收集的成就。
        </p>
      </header>

      <section class="app-page-content app-section-stack flex-1 tasks-page-content">
        <section v-if="!canUseTasks" class="task-pairing-card task-pairing-card--compact"
          aria-labelledby="task-list-pairing-title">
          <div class="task-pairing-copy">
            <h2 id="task-list-pairing-title">共同生活需要兩個人一起開始</h2>
            <p>配對夥伴後，就能開始為彼此指派任務、累積點數囉！</p>
          </div>

          <RouterLink class="task-pairing-action" :to="{ name: 'pairing' }">
            <span class="material-symbols-outlined fill" aria-hidden="true">person_add</span>
            去邀請夥伴
          </RouterLink>
        </section>

        <template v-else>
          <section class="app-metric-grid">
            <article class="app-card app-card-section-sm">
              <p class="app-label">待完成</p>
              <p class="app-metric-value mt-[8px]">{{ myAssignedTasks.length }}</p>
            </article>

            <article class="app-card-muted app-card-section-sm">
              <p class="app-label">待確認</p>
              <p class="app-metric-value mt-[8px]">
                {{ waitingConfirmTasks.length }}
              </p>
            </article>
          </section>

          <section class="app-card app-card-section">
            <div class="app-card-header-split">
              <div class="min-w-[0px]">
                <p class="app-card-title">我的任務</p>
              </div>
            </div>

            <div class="app-card-list mt-[20px]">
              <TaskListCard v-for="task in myAssignedTasks" :key="task.id" :current-uid="currentUid"
                :is-submitting="isSubmitting" :partner-name="assigneeLabel" :task="task" @cancel="handleCancelTask"
                @complete="handleCompleteTask" @confirm="handleConfirmTask" />

              <AppEmptyState v-if="!myAssignedTasks.length" title="目前沒有待完成任務" />
            </div>
          </section>

          <section class="app-card app-card-section">
            <div class="app-card-header-split">
              <div class="min-w-[0px]">
                <p class="app-card-title">等待你確認</p>
              </div>
            </div>

            <div class="app-card-list mt-[20px]">
              <TaskListCard v-for="task in waitingConfirmTasks" :key="task.id" :current-uid="currentUid"
                :is-submitting="isSubmitting" :partner-name="assigneeLabel" :task="task" @cancel="handleCancelTask"
                @complete="handleCompleteTask" @confirm="handleConfirmTask" />

              <AppEmptyState v-if="!waitingConfirmTasks.length" title="目前沒有等待確認的任務" />
            </div>
          </section>

          <section class="app-card app-card-section">
            <div class="app-card-header-split">
              <div class="min-w-[0px]">
                <p class="app-card-title">等待對方完成</p>
              </div>
            </div>

            <div class="app-card-list mt-[20px]">
              <TaskListCard v-for="task in waitingOtherTasks" :key="task.id" :current-uid="currentUid"
                :is-submitting="isSubmitting" :partner-name="assigneeLabel" :task="task" @cancel="handleCancelTask"
                @complete="handleCompleteTask" @confirm="handleConfirmTask" />

              <AppEmptyState v-if="!waitingOtherTasks.length" title="目前沒有等待對方的任務" />
            </div>
          </section>

          <section class="app-metric-grid">
            <article class="app-card app-card-section-sm">
              <p class="app-label">已完成</p>
              <p class="app-metric-value mt-[8px]">{{ confirmedTasks.length }}</p>
            </article>

            <article class="app-card-muted app-card-section-sm">
              <p class="app-label">已取消</p>
              <p class="app-metric-value mt-[8px]">{{ cancelledTasks.length }}</p>
            </article>
          </section>

          <section class="app-card app-card-section">
            <div class="app-card-header-split">
              <p class="app-card-title">完成紀錄</p>
            </div>

            <div class="app-card-list mt-[20px]">
              <TaskListCard v-for="task in confirmedTasks" :key="task.id" :current-uid="currentUid"
                :is-submitting="isSubmitting" :partner-name="assigneeLabel" :task="task" @cancel="handleCancelTask"
                @complete="handleCompleteTask" @confirm="handleConfirmTask" />

              <AppEmptyState v-if="!confirmedTasks.length" title="目前沒有完成紀錄" />
            </div>
          </section>

          <section class="app-card app-card-section">
            <div class="app-card-header-split">
              <p class="app-card-title">取消紀錄</p>
            </div>

            <div class="app-card-list mt-[20px]">
              <TaskListCard v-for="task in cancelledTasks" :key="task.id" :current-uid="currentUid"
                :is-submitting="isSubmitting" :partner-name="assigneeLabel" :task="task" @cancel="handleCancelTask"
                @complete="handleCompleteTask" @confirm="handleConfirmTask" />

              <AppEmptyState v-if="!cancelledTasks.length" title="目前沒有取消紀錄" />
            </div>
          </section>
        </template>
      </section>
    </template>
  </MobileAppShell>
</template>

<style scoped>
.task-create-topbar {
  display: grid;
  grid-template-columns: 3.5rem minmax(0, 1fr) 3.5rem;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 1.75rem 0.75rem;
}

.task-create-avatar,
.task-create-settings {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 999px;
}

.task-create-avatar {
  background: #213743;
  color: #ff9e85;
  box-shadow: 0 10px 26px rgba(33, 55, 67, 0.18);
}

.task-create-avatar .material-symbols-outlined {
  font-size: 1.9rem;
}

.task-create-settings {
  justify-self: end;
  color: #ff9e85;
  text-decoration: none;
}

.task-create-settings .material-symbols-outlined {
  font-size: 2.7rem;
}

.task-create-title {
  margin: 0;
  color: #ff9e85;
  font-size: var(--app-type-28);
  font-weight: 900;
  line-height: 1.15;
}

.tasks-page-header {
  padding-bottom: 1.25rem;
}

.tasks-page-content {
  gap: 1.5rem;
}

.tasks-create-page {
  display: grid;
  align-content: center;
  padding-top: 1.75rem;
  padding-bottom: 2rem;
}

.task-pairing-card {
  display: grid;
  gap: 1.75rem;
  border-radius: 2rem;
  background: #ffffff;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 24px 52px rgba(148, 72, 53, 0.08);
}

.task-pairing-card--compact {
  align-content: center;
  min-height: 24rem;
}

.task-pairing-visual {
  border-radius: 1.6rem;
  background: #f7f1ee;
  padding: 0.75rem;
}

.task-pairing-map {
  position: relative;
  display: grid;
  min-height: 21rem;
  overflow: hidden;
  place-items: end center;
  border-radius: 1.45rem;
  background:
    radial-gradient(circle at 50% 48%, rgba(65, 142, 164, 0.72), transparent 34%),
    radial-gradient(circle at 30% 35%, rgba(255, 255, 255, 0.08), transparent 18%),
    linear-gradient(135deg, #061927 0%, #0d3448 54%, #05131f 100%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.task-pairing-map::before {
  position: absolute;
  inset: 12% 8% 22%;
  content: "";
  opacity: 0.18;
  background:
    radial-gradient(ellipse at 18% 34%, #d8f7ff 0 10%, transparent 10.5%),
    radial-gradient(ellipse at 35% 28%, #d8f7ff 0 7%, transparent 7.5%),
    radial-gradient(ellipse at 50% 55%, #d8f7ff 0 11%, transparent 11.5%),
    radial-gradient(ellipse at 72% 38%, #d8f7ff 0 17%, transparent 17.5%),
    radial-gradient(ellipse at 80% 62%, #d8f7ff 0 9%, transparent 9.5%);
  filter: blur(0.5px);
}

.task-pairing-bolt {
  position: absolute;
  top: 17%;
  right: 15%;
  width: 9.5rem;
  height: 5.5rem;
  background: linear-gradient(135deg, #ffd764, #ffb344);
  clip-path: polygon(0 13%, 39% 0, 49% 24%, 100% 0, 50% 100%, 42% 63%, 10% 80%);
  filter: drop-shadow(0 12px 16px rgba(0, 0, 0, 0.2));
  transform: rotate(-16deg);
}

.task-pairing-bubble {
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4.6rem;
  height: 4.6rem;
  border-radius: 999px;
  background: #f3f6f8;
  box-shadow: 0 10px 18px rgba(4, 15, 24, 0.24);
}

.task-pairing-bubble--heart {
  top: 5%;
  right: 5%;
  color: #ff9e85;
}

.task-pairing-bubble--home {
  bottom: 5%;
  left: 5%;
  color: #2f6857;
}

.task-pairing-bubble .material-symbols-outlined {
  font-size: 2rem;
}

.task-pairing-visual-copy {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 0.15rem;
  margin-bottom: 3.9rem;
  color: #ffd764;
  font-size: var(--app-type-15);
  font-weight: 900;
  letter-spacing: 0.2em;
}

.task-pairing-visual-copy strong {
  color: #ffe176;
  font-size: var(--app-type-18);
  letter-spacing: 0.07em;
}

.task-pairing-copy {
  display: grid;
  gap: 1rem;
  justify-items: center;
}

.task-pairing-copy h2,
.task-pairing-copy p,
.task-pairing-status {
  margin: 0;
}

.task-pairing-copy h2 {
  max-width: 17rem;
  color: #211a18;
  font-size: var(--app-type-20);
  font-weight: 700;
  line-height: 1.55;
}

.task-pairing-copy p {
  max-width: 19rem;
  color: #3f302c;
  font-size: var(--app-type-18);
  font-weight: 500;
  line-height: 1.55;
}

.task-pairing-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  min-height: 4.35rem;
  border-radius: 999px;
  background: #ff9e85;
  color: #783321;
  font-size: var(--app-type-20);
  font-weight: 900;
  text-decoration: none;
  box-shadow: 0 18px 34px rgba(255, 158, 133, 0.28);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.task-pairing-action:active {
  transform: scale(0.98);
}

.task-pairing-action .material-symbols-outlined {
  font-size: 1.7rem;
}

.task-pairing-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  justify-self: center;
  gap: 0.65rem;
  border-radius: 999px;
  background: #fff4f1;
  padding: 0.75rem 1.5rem;
  color: #5f8a7f;
  font-size: var(--app-type-15);
  font-weight: 700;
}

.task-pairing-status span {
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 999px;
  background: #2f6857;
}

@media (max-width: 380px) {
  .task-create-topbar {
    grid-template-columns: 3rem minmax(0, 1fr) 3rem;
    padding-right: 1.25rem;
    padding-left: 1.25rem;
  }

  .task-create-title {
    font-size: var(--app-type-24);
  }

  .task-pairing-map {
    min-height: 17rem;
  }

  .task-pairing-bolt {
    width: 7.5rem;
    height: 4.6rem;
  }
}
</style>
