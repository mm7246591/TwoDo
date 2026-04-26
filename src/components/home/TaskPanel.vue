<script setup lang="ts">
import AppEmptyState from "@/components/common/AppEmptyState.vue";
import DashboardIcon from "@/components/common/DashboardIcon.vue";
import type {
  HomeDashboardRouteName,
  HomePanelAction,
  HomePanelMetric,
  HomeTaskItem,
} from "@/views/home/type/interface";

const emit = defineEmits<{
  complete: [taskId: string];
  confirm: [taskId: string];
  navigate: [routeName: HomeDashboardRouteName];
  remind: [taskId: string];
}>();
defineProps<{
  action?: HomePanelAction;
  emptyState?: {
    description?: string;
    title?: string;
  };
  emptyVariant?: "confirmation" | "focus";
  icon?: HomePanelAction["icon"];
  isSubmitting?: boolean;
  items: HomeTaskItem[];
  metrics?: HomePanelMetric[];
  title: string;
}>();

const badgeClassMap: Record<HomeTaskItem["badgeTone"], string> = {
  accent: "bg-[var(--app-accent-soft)] text-[var(--app-accent-strong)]",
  neutral: "bg-[var(--app-surface-muted)] text-[var(--app-text-muted)]",
  success: "bg-[var(--app-support-soft)] text-[var(--app-success-text)]",
};

const handleNavigate = (routeName: HomeDashboardRouteName) => {
  emit("navigate", routeName);
};

const handleEmptyAction = (action?: HomePanelAction) => {
  if (!action) {
    return;
  }

  emit("navigate", action.routeName);
};

const handleComplete = (taskId: string) => {
  emit("complete", taskId);
};

const handleConfirm = (taskId: string) => {
  emit("confirm", taskId);
};

const handleRemind = (taskId: string) => {
  emit("remind", taskId);
};
</script>

<template>
  <section class="grid gap-[16px]">
    <div
      class="flex min-h-[40px] items-center justify-between gap-[12px]"
    >
      <h2
        class="m-[0px] text-[24px] font-[800] leading-[1.3] tracking-[0px] text-[var(--app-text-strong)]"
      >
        {{ title }}
      </h2>

      <button
        v-if="action"
        class="min-h-[40px] border-[0px] bg-transparent p-[0px] text-[14px] font-[800] text-[var(--app-accent-strong)] focus-visible:outline-none focus-visible:underline focus-visible:underline-offset-[3px]"
        type="button"
        @click="handleNavigate(action.routeName)"
      >
        {{ action.label }}
      </button>

      <span
        v-else-if="icon"
        class="inline-flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[var(--app-accent-soft)] text-[var(--app-accent-strong)]"
        aria-hidden="true"
      >
        <DashboardIcon :name="icon" :size="18" />
      </span>
    </div>

    <div class="grid gap-[12px]">
      <article
        v-for="item in items"
        :key="item.id"
        class="flex flex-wrap items-center justify-between gap-[12px] rounded-[16px] border border-[rgba(255,255,255,0.72)] bg-[var(--app-surface-strong)] p-[12px] shadow-[0_10px_26px_rgba(148,72,53,0.05)] transition-[box-shadow,transform] duration-[180ms] ease-in-out hover:-translate-y-[1px] hover:shadow-[0_14px_34px_rgba(148,72,53,0.09)]"
      >
        <div
          class="flex min-w-[0px] flex-[1_1_160px] items-center gap-[12px]"
        >
          <button
            class="inline-flex h-[28px] min-h-[28px] w-[28px] min-w-[28px] items-center justify-center rounded-full border-[2px] border-[var(--app-border-strong)] bg-transparent p-[0px] text-transparent transition-[border-color,color,transform] duration-[180ms] ease-in-out hover:scale-[1.04] hover:border-[var(--app-accent-strong)] hover:text-[var(--app-accent-strong)] focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--app-input-focus-ring)] disabled:scale-100 disabled:opacity-45"
            type="button"
            :disabled="!item.canComplete || isSubmitting"
            :aria-label="
              item.canComplete
                ? `標記 ${item.title} 完成`
                : `${item.title} 目前不能標記完成`
            "
            @click="handleComplete(item.id)"
          >
            <DashboardIcon name="shield-check" :size="14" />
          </button>

          <div class="min-w-[0px]">
            <p
              class="m-[0px] overflow-hidden text-ellipsis whitespace-nowrap text-[16px] font-[800] leading-[1.35] text-[var(--app-text-strong)]"
            >
              {{ item.title }}
            </p>
            <p
              class="m-[0px] mt-[4px] overflow-hidden text-[13px] leading-[1.5] text-[var(--app-text-muted)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
            >
              {{ item.description }}
            </p>
          </div>
        </div>

        <div
          :class="[
            'inline-flex flex-none items-center justify-center whitespace-nowrap rounded-full px-[12px] py-[6px] text-[12px] font-[800] leading-[1.2]',
            badgeClassMap[item.badgeTone],
          ]"
        >
          {{ item.badge }}
        </div>

        <div
          v-if="item.canConfirm"
          class="grid w-full grid-cols-2 gap-[8px] pt-[4px]"
        >
          <button
            class="min-h-[40px] rounded-[12px] border-[0px] bg-[var(--app-support)] px-[12px] py-[9px] text-[14px] font-[800] text-[var(--app-success-text)] transition-[background-color,opacity,transform] duration-[180ms] ease-in-out hover:-translate-y-[1px] focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--app-input-focus-ring)] disabled:translate-y-[0px] disabled:opacity-55"
            type="button"
            :disabled="isSubmitting"
            @click="handleConfirm(item.id)"
          >
            確認完成
          </button>
          <button
            class="min-h-[40px] rounded-[12px] border-[0px] bg-[var(--app-surface-muted)] px-[12px] py-[9px] text-[14px] font-[800] text-[var(--app-text-muted)] transition-[background-color,opacity,transform] duration-[180ms] ease-in-out hover:-translate-y-[1px] focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--app-input-focus-ring)] disabled:translate-y-[0px] disabled:opacity-55"
            type="button"
            :disabled="isSubmitting"
            @click="handleRemind(item.id)"
          >
            提醒一下
          </button>
        </div>
      </article>

      <AppEmptyState
        v-if="!items.length && !emptyVariant"
        :title="emptyState?.title"
        :description="emptyState?.description"
      />

      <div
        v-if="!items.length && emptyVariant === 'focus'"
        class="flex flex-col items-center rounded-[24px] border-[2px] border-dashed border-[rgba(218,193,187,0.72)] bg-[var(--app-surface-strong)] p-[32px] text-center shadow-[0_8px_30px_rgba(148,72,53,0.05)]"
      >
        <div class="mt-[24px] grid gap-[8px]">
          <p
            class="m-[0px] text-[18px] font-[800] leading-[1.45] text-[var(--app-text-strong)]"
          >
            {{ emptyState?.title || "目前沒有焦點任務" }}
          </p>
          <p
            class="m-[0px] max-w-[280px] text-[15px] font-[500] leading-[1.65] text-[var(--app-text-muted)]"
          >
            {{ emptyState?.description || "新增一個任務，讓今天更有節奏。" }}
          </p>
        </div>

        <button
          v-if="action"
          class="mt-[28px] min-h-[40px] rounded-full border-[0px] bg-[var(--app-coral)] px-[40px] py-[12px] text-[15px] font-[800] text-[var(--app-accent-strong)] transition-[opacity,transform] duration-[180ms] ease-in-out hover:-translate-y-[1px] hover:opacity-90 focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--app-input-focus-ring)] active:scale-[0.98]"
          type="button"
          @click="handleEmptyAction(action)"
        >
          新增任務
        </button>
      </div>

      <div
        v-if="!items.length && emptyVariant === 'confirmation'"
        class="relative flex min-h-[244px] flex-col items-center justify-center rounded-[24px] border-[2px] border-dashed border-[rgba(218,193,187,0.72)] bg-[var(--app-surface-strong)] p-[40px] text-center shadow-[0_8px_30px_rgba(148,72,53,0.05)]"
      >
        <div class="relative" aria-hidden="true">
          <span
            class="material-symbols-outlined fill text-[40px] leading-none text-[rgba(148,72,53,0.25)]"
          >
            favorite
          </span>
          <span
            class="absolute right-[0px] top-[0px] h-[12px] w-[12px] rounded-full bg-[var(--app-support)]"
          />
        </div>

        <p
          class="m-[0px] mt-[20px] max-w-[280px] text-[15px] font-[500] leading-[1.7] text-[var(--app-text-muted)]"
        >
          {{
            emptyState?.description ||
            "夥伴還在努力中，等他完成任務後再來給個大大的擁抱吧！"
          }}
        </p>
      </div>
    </div>

    <div v-if="metrics?.length" class="mt-[20px] grid grid-cols-2 gap-[12px]">
      <article
        v-for="metric in metrics"
        :key="metric.label"
        class="rounded-[1.4rem] border border-white/65 bg-white/70 p-[16px] backdrop-blur-[12px]"
      >
        <p class="text-[13px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]">{{ metric.label }}</p>
        <p class="text-[18px] font-[700] leading-[1.3] tracking-[-0.01em] text-[var(--app-text-strong)] mt-[8px]">{{ metric.value }}</p>
      </article>
    </div>
  </section>
</template>






