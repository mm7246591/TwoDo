import type { MessagePayload } from "firebase/messaging";
import { showAppToast } from "@/services/appToast";
import { showForegroundPushNotification } from "@/services/pushNotificationService";

const getPayloadTitle = (payload: MessagePayload) =>
  payload.notification?.title?.trim() || payload.data?.title?.trim() || "TwoDo 通知";

const getPayloadMessage = (payload: MessagePayload) =>
  payload.notification?.body?.trim() || payload.data?.message?.trim() || "";

const getPayloadLink = (payload: MessagePayload) =>
  payload.data?.link?.trim() || "/notifications";

const getPayloadType = (payload: MessagePayload) =>
  payload.data?.type?.trim() || "";

const getPayloadIcon = (payload: MessagePayload) => {
  const type = getPayloadType(payload);

  if (type === "task_completed_pending_confirm") {
    return "task_alt";
  }

  if (type === "reward_redeemed") {
    return "redeem";
  }

  return "notifications";
};

const shouldShowInAppToast = () =>
  typeof document !== "undefined" &&
  document.visibilityState === "visible" &&
  typeof document.hasFocus === "function" &&
  document.hasFocus();

const showInAppForegroundToast = (payload: MessagePayload) => {
  const message = getPayloadMessage(payload);

  if (!message) {
    showForegroundPushNotification(payload);
    return;
  }

  showAppToast({
    icon: getPayloadIcon(payload),
    link: getPayloadLink(payload),
    message,
    title: getPayloadTitle(payload),
    variant: "notification",
  });
};

export const handleForegroundPushMessage = (payload: MessagePayload) => {
  if (shouldShowInAppToast()) {
    showInAppForegroundToast(payload);
    return;
  }

  showForegroundPushNotification(payload);
};
