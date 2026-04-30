/**
 * 管理全域應用內 toast 狀態與顯示/關閉操作。
 */
import { readonly, ref } from "vue";

type AppToastVariant = "error" | "info" | "loading" | "notification" | "success";

interface ShowAppToastOptions {
  dismissible?: boolean;
  duration?: number;
  icon?: string;
  link?: string;
  message: string;
  title?: string;
  variant?: AppToastVariant;
}

interface AppToast {
  dismissible: boolean;
  icon: string;
  id: number;
  link: string;
  message: string;
  title: string;
  variant: AppToastVariant;
}

const DEFAULT_ICONS: Record<AppToastVariant, string> = {
  error: "error",
  info: "notifications",
  loading: "progress_activity",
  notification: "notifications",
  success: "task_alt",
};

const DEFAULT_AUTO_DISMISS_DURATION = 3000;

const DEFAULT_DURATIONS: Record<AppToastVariant, number> = {
  error: DEFAULT_AUTO_DISMISS_DURATION,
  info: DEFAULT_AUTO_DISMISS_DURATION,
  loading: 0,
  notification: DEFAULT_AUTO_DISMISS_DURATION,
  success: DEFAULT_AUTO_DISMISS_DURATION,
};

let toastId = 0;
let toastTimer: ReturnType<typeof window.setTimeout> | null = null;

const appToast = ref<AppToast | null>(null);

const clearToastTimer = () => {
  if (!toastTimer) {
    return;
  }

  window.clearTimeout(toastTimer);
  toastTimer = null;
};

/**
 * 關閉目前顯示的 toast，並清除自動關閉計時器。
 */
const hideAppToast = () => {
  clearToastTimer();
  appToast.value = null;
};

/**
 * 顯示全域 toast，空訊息不會建立顯示狀態。
 *
 * @param options - toast 顯示內容、型態與自動關閉設定。
 */
const showAppToast = (options: ShowAppToastOptions) => {
  const message = options.message.trim();

  if (!message) {
    return;
  }

  const variant = options.variant ?? "info";
  const duration = options.duration ?? DEFAULT_DURATIONS[variant];

  clearToastTimer();

  appToast.value = {
    dismissible: options.dismissible ?? variant !== "loading",
    icon: options.icon ?? DEFAULT_ICONS[variant],
    id: toastId += 1,
    link: options.link?.trim() ?? "",
    message,
    title: options.title?.trim() ?? "",
    variant,
  };

  if (duration > 0) {
    toastTimer = window.setTimeout(() => {
      appToast.value = null;
      toastTimer = null;
    }, duration);
  }
};

/**
 * 取得唯讀 toast 狀態，供根元件渲染全域提示。
 *
 * @returns 唯讀的目前 toast 狀態。
 */
const useAppToastState = () => readonly(appToast);

export type { AppToast, AppToastVariant, ShowAppToastOptions };
export { hideAppToast, showAppToast, useAppToastState };
