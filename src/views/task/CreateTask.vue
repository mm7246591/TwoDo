<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import AppEmptyState from "@/components/common/AppEmptyState.vue";
import TaskForm from "@/components/task/TaskForm.vue";
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

const isCreateRoute = computed(() => route.name === "create-task");
</script>

<template>
  <MobileAppShell>
    <template v-if="isCreateRoute">
      <section
        class="grid flex-1 content-center px-[20px] pb-[32px] pt-[28px] sm:px-[28px]"
      >
        <section
          v-if="!canUseTasks"
          class="grid gap-[28px] rounded-[2rem] bg-white p-[24px] text-center shadow-[0_24px_52px_rgba(148,72,53,0.08)]"
          aria-labelledby="task-pairing-title"
        >
          <div
            class="rounded-[1.6rem] bg-[#f7f1ee] p-[12px]"
            aria-hidden="true"
          >
            <div
              class="relative grid min-h-[21rem] place-items-end overflow-hidden rounded-[1.45rem] bg-[radial-gradient(circle_at_50%_48%,rgba(65,142,164,0.72),transparent_34%),radial-gradient(circle_at_30%_35%,rgba(255,255,255,0.08),transparent_18%),linear-gradient(135deg,#061927_0%,#0d3448_54%,#05131f_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] max-[380px]:min-h-[17rem]"
            >
              <span
                class="absolute right-[15%] top-[17%] h-[5.5rem] w-[9.5rem] rotate-[-16deg] bg-[linear-gradient(135deg,#ffd764,#ffb344)] [clip-path:polygon(0_13%,39%_0,49%_24%,100%_0,50%_100%,42%_63%,10%_80%)] [filter:drop-shadow(0_12px_16px_rgba(0,0,0,0.2))] max-[380px]:h-[4.6rem] max-[380px]:w-[7.5rem]"
              ></span>
              <span
                class="absolute right-[5%] top-[5%] inline-flex h-[4.6rem] w-[4.6rem] items-center justify-center rounded-full bg-[#f3f6f8] text-[#ff9e85] shadow-[0_10px_18px_rgba(4,15,24,0.24)] [&_.material-symbols-outlined]:text-[2rem]"
              >
                <span class="material-symbols-outlined fill">favorite</span>
              </span>
              <span
                class="absolute bottom-[5%] left-[5%] inline-flex h-[4.6rem] w-[4.6rem] items-center justify-center rounded-full bg-[#f3f6f8] text-[#2f6857] shadow-[0_10px_18px_rgba(4,15,24,0.24)] [&_.material-symbols-outlined]:text-[2rem]"
              >
                <span class="material-symbols-outlined fill">home</span>
              </span>
              <div
                class="relative z-[1] mb-[3.9rem] grid gap-[0.15rem] text-[15px] font-[900] tracking-[0.2em] text-[#ffd764] [&_strong]:text-[18px] [&_strong]:tracking-[0.07em] [&_strong]:text-[#ffe176]"
              >
                <span>PARTNERSHIP</span>
                <strong>SAFE WORK</strong>
              </div>
            </div>
          </div>

          <div
            class="grid justify-items-center gap-[16px] [&_h2]:m-[0px] [&_h2]:max-w-[17rem] [&_h2]:text-[20px] [&_h2]:font-[700] [&_h2]:leading-[1.55] [&_h2]:text-[#211a18] [&_p]:m-[0px] [&_p]:max-w-[19rem] [&_p]:text-[18px] [&_p]:font-[500] [&_p]:leading-[1.55] [&_p]:text-[#3f302c]"
          >
            <h2 id="task-pairing-title">配對後一起開始任務</h2>
            <p>完成配對後，就能同步任務、確認進度與累積點數。</p>
          </div>

          <RouterLink
            class="inline-flex min-h-[4.35rem] items-center justify-center gap-[0.55rem] rounded-full bg-[#ff9e85] text-[20px] font-[900] text-[#783321] no-underline shadow-[0_18px_34px_rgba(255,158,133,0.28)] transition-[transform,box-shadow] duration-[180ms] active:scale-[0.98] [&_.material-symbols-outlined]:text-[1.7rem]"
            :to="{ name: 'pairing' }"
          >
            <span class="material-symbols-outlined fill" aria-hidden="true"
              >person_add</span
            >
            前往配對
          </RouterLink>

          <p
            class="inline-flex items-center justify-center justify-self-center gap-[0.65rem] rounded-full bg-[#fff4f1] px-[24px] py-[12px] text-[15px] font-[700] text-[#5f8a7f] [&_span]:h-[0.65rem] [&_span]:w-[0.65rem] [&_span]:rounded-full [&_span]:bg-[#2f6857]"
          >
            <span aria-hidden="true"></span>
            邀請對方加入後開始
          </p>
        </section>

        <TaskForm
          v-else
          :assignee-label="assigneeLabel"
          :current-uid="currentUid"
          :default-assigned-to="defaultAssignedTo"
          :is-submitting="isSubmitting"
          @submit="handleCreateTask"
        />
      </section>
    </template>

    <template v-else>
      <header
        class="grid gap-[20px] px-[20px] pb-[20px] pt-[32px] sm:px-[28px] sm:pt-[40px]"
      >
        <div class="flex items-start justify-between gap-[12px]">
          <div class="min-w-[0px]">
            <h1
              class="text-[32px] font-[700] leading-[1.04] tracking-[-0.03em] text-[var(--app-text-strong)] mt-[12px]"
            >
              一起完成小冒險
            </h1>
          </div>
        </div>

        <p
          class="max-w-[34ch] text-[16px] leading-[1.65] text-[var(--app-text-muted)]"
        >
          安排彼此的小任務，把日常變成可以一起收集的成就。
        </p>
      </header>

      <section class="px-[20px] pb-[24px] sm:px-[28px] grid flex-1 gap-[24px]">
        <section
          v-if="!canUseTasks"
          class="grid min-h-[24rem] content-center gap-[28px] rounded-[2rem] bg-white p-[24px] text-center shadow-[0_24px_52px_rgba(148,72,53,0.08)]"
          aria-labelledby="task-list-pairing-title"
        >
          <div
            class="grid justify-items-center gap-[16px] [&_h2]:m-[0px] [&_h2]:max-w-[17rem] [&_h2]:text-[20px] [&_h2]:font-[700] [&_h2]:leading-[1.55] [&_h2]:text-[#211a18] [&_p]:m-[0px] [&_p]:max-w-[19rem] [&_p]:text-[18px] [&_p]:font-[500] [&_p]:leading-[1.55] [&_p]:text-[#3f302c]"
          >
            <h2 id="task-list-pairing-title">配對後一起開始任務</h2>
            <p>完成配對後，就能同步任務、確認進度與累積點數。</p>
          </div>

          <RouterLink
            class="inline-flex min-h-[4.35rem] items-center justify-center gap-[0.55rem] rounded-full bg-[#ff9e85] text-[20px] font-[900] text-[#783321] no-underline shadow-[0_18px_34px_rgba(255,158,133,0.28)] transition-[transform,box-shadow] duration-[180ms] active:scale-[0.98] [&_.material-symbols-outlined]:text-[1.7rem]"
            :to="{ name: 'pairing' }"
          >
            <span class="material-symbols-outlined fill" aria-hidden="true"
              >person_add</span
            >
            前往配對
          </RouterLink>
        </section>

        <template v-else>
          <section class="grid grid-cols-2 gap-[16px]">
            <article
              class="rounded-[var(--app-radius-xl)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] backdrop-blur-[14px] p-[16px]"
            >
              <p
                class="text-[13px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]"
              >
                待完成
              </p>
              <p
                class="text-[28px] font-[700] leading-[1.02] tracking-[-0.03em] text-[var(--app-text-strong)] [font-variant-numeric:tabular-nums] mt-[8px]"
              >
                {{ myAssignedTasks.length }}
              </p>
            </article>

            <article
              class="rounded-[var(--app-radius-xl)] border border-[var(--app-card-muted-border)] bg-[image:var(--app-card-muted-bg)] backdrop-blur-[10px] p-[16px]"
            >
              <p
                class="text-[13px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]"
              >
                待確認
              </p>
              <p
                class="text-[28px] font-[700] leading-[1.02] tracking-[-0.03em] text-[var(--app-text-strong)] [font-variant-numeric:tabular-nums] mt-[8px]"
              >
                {{ waitingConfirmTasks.length }}
              </p>
            </article>
          </section>

          <section
            class="rounded-[var(--app-radius-xl)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] backdrop-blur-[14px] p-[20px]"
          >
            <div
              class="flex flex-col gap-[16px] sm:flex-row sm:items-start sm:justify-between"
            >
              <div class="min-w-[0px]">
                <p
                  class="text-[18px] font-[700] leading-[1.3] tracking-[-0.01em] text-[var(--app-text-strong)]"
                >
                  我的任務
                </p>
              </div>
            </div>

            <div class="grid gap-[16px] mt-[20px]">
              <TaskListCard
                v-for="task in myAssignedTasks"
                :key="task.id"
                :current-uid="currentUid"
                :is-submitting="isSubmitting"
                :partner-name="assigneeLabel"
                :task="task"
                @cancel="handleCancelTask"
                @complete="handleCompleteTask"
                @confirm="handleConfirmTask"
              />

              <AppEmptyState
                v-if="!myAssignedTasks.length"
                title="目前沒有我的任務"
              />
            </div>
          </section>

          <section
            class="rounded-[var(--app-radius-xl)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] backdrop-blur-[14px] p-[20px]"
          >
            <div
              class="flex flex-col gap-[16px] sm:flex-row sm:items-start sm:justify-between"
            >
              <div class="min-w-[0px]">
                <p
                  class="text-[18px] font-[700] leading-[1.3] tracking-[-0.01em] text-[var(--app-text-strong)]"
                >
                  等待你確認
                </p>
              </div>
            </div>

            <div class="grid gap-[16px] mt-[20px]">
              <TaskListCard
                v-for="task in waitingConfirmTasks"
                :key="task.id"
                :current-uid="currentUid"
                :is-submitting="isSubmitting"
                :partner-name="assigneeLabel"
                :task="task"
                @cancel="handleCancelTask"
                @complete="handleCompleteTask"
                @confirm="handleConfirmTask"
              />

              <AppEmptyState
                v-if="!waitingConfirmTasks.length"
                title="目前沒有等待確認的任務"
              />
            </div>
          </section>

          <section
            class="rounded-[var(--app-radius-xl)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] backdrop-blur-[14px] p-[20px]"
          >
            <div
              class="flex flex-col gap-[16px] sm:flex-row sm:items-start sm:justify-between"
            >
              <div class="min-w-[0px]">
                <p
                  class="text-[18px] font-[700] leading-[1.3] tracking-[-0.01em] text-[var(--app-text-strong)]"
                >
                  等待對方完成
                </p>
              </div>
            </div>

            <div class="grid gap-[16px] mt-[20px]">
              <TaskListCard
                v-for="task in waitingOtherTasks"
                :key="task.id"
                :current-uid="currentUid"
                :is-submitting="isSubmitting"
                :partner-name="assigneeLabel"
                :task="task"
                @cancel="handleCancelTask"
                @complete="handleCompleteTask"
                @confirm="handleConfirmTask"
              />

              <AppEmptyState
                v-if="!waitingOtherTasks.length"
                title="目前沒有等待對方完成的任務"
              />
            </div>
          </section>

          <section class="grid grid-cols-2 gap-[16px]">
            <article
              class="rounded-[var(--app-radius-xl)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] backdrop-blur-[14px] p-[16px]"
            >
              <p
                class="text-[13px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]"
              >
                已完成
              </p>
              <p
                class="text-[28px] font-[700] leading-[1.02] tracking-[-0.03em] text-[var(--app-text-strong)] [font-variant-numeric:tabular-nums] mt-[8px]"
              >
                {{ confirmedTasks.length }}
              </p>
            </article>

            <article
              class="rounded-[var(--app-radius-xl)] border border-[var(--app-card-muted-border)] bg-[image:var(--app-card-muted-bg)] backdrop-blur-[10px] p-[16px]"
            >
              <p
                class="text-[13px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]"
              >
                已取消
              </p>
              <p
                class="text-[28px] font-[700] leading-[1.02] tracking-[-0.03em] text-[var(--app-text-strong)] [font-variant-numeric:tabular-nums] mt-[8px]"
              >
                {{ cancelledTasks.length }}
              </p>
            </article>
          </section>

          <section
            class="rounded-[var(--app-radius-xl)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] backdrop-blur-[14px] p-[20px]"
          >
            <div
              class="flex flex-col gap-[16px] sm:flex-row sm:items-start sm:justify-between"
            >
              <p
                class="text-[18px] font-[700] leading-[1.3] tracking-[-0.01em] text-[var(--app-text-strong)]"
              >
                完成紀錄
              </p>
            </div>

            <div class="grid gap-[16px] mt-[20px]">
              <TaskListCard
                v-for="task in confirmedTasks"
                :key="task.id"
                :current-uid="currentUid"
                :is-submitting="isSubmitting"
                :partner-name="assigneeLabel"
                :task="task"
                @cancel="handleCancelTask"
                @complete="handleCompleteTask"
                @confirm="handleConfirmTask"
              />

              <AppEmptyState
                v-if="!confirmedTasks.length"
                title="目前沒有完成紀錄"
              />
            </div>
          </section>

          <section
            class="rounded-[var(--app-radius-xl)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] backdrop-blur-[14px] p-[20px]"
          >
            <div
              class="flex flex-col gap-[16px] sm:flex-row sm:items-start sm:justify-between"
            >
              <p
                class="text-[18px] font-[700] leading-[1.3] tracking-[-0.01em] text-[var(--app-text-strong)]"
              >
                取消紀錄
              </p>
            </div>

            <div class="grid gap-[16px] mt-[20px]">
              <TaskListCard
                v-for="task in cancelledTasks"
                :key="task.id"
                :current-uid="currentUid"
                :is-submitting="isSubmitting"
                :partner-name="assigneeLabel"
                :task="task"
                @cancel="handleCancelTask"
                @complete="handleCompleteTask"
                @confirm="handleConfirmTask"
              />

              <AppEmptyState
                v-if="!cancelledTasks.length"
                title="目前沒有取消紀錄"
              />
            </div>
          </section>
        </template>
      </section>
    </template>
  </MobileAppShell>
</template>
