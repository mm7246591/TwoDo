/**
 * 提供根路由頁面轉場名稱管理，讓不同導頁入口能指定下一次頁面動畫。
 */
import { ref } from "vue";
import type { RouteLocationNormalizedLoaded } from "vue-router";

const DEFAULT_TRANSITION_NAME = "route-fade";
const DOCK_TRANSITION_NAME = "route-fade-up";
const SLIDE_LEFT_TRANSITION_NAME = "route-slide-left";
const SLIDE_RIGHT_TRANSITION_NAME = "route-slide-right";
const DOCK_ROUTE_NAMES = new Set(["home", "pairing", "reward", "task-list"]);
const SETTING_ROUTE_DEPTH = new Map([
  ["setting", 1],
  ["setting-profile", 2],
  ["setting-partner", 2],
]);

/** 管理下一次頁面切換要使用的根路由轉場名稱。 */
const routeTransitionName = ref(DEFAULT_TRANSITION_NAME);
let pendingRouteTransitionName: string | null = null;

/**
 * 標記下一次路由切換要使用的轉場名稱。
 *
 * @param name - 對應根層 `Transition` 的 name。
 */
export const setNextRouteTransitionName = (name: string) => {
  pendingRouteTransitionName = name;
};

/**
 * 標記下一次路由切換為底部導覽的淡入上移轉場。
 */
export const setNextDockRouteTransition = () => {
  setNextRouteTransitionName(DOCK_TRANSITION_NAME);
};

/**
 * 標記下一次路由切換為向左推進的設定頁轉場。
 */
export const setNextSettingForwardTransition = () => {
  setNextRouteTransitionName(SLIDE_LEFT_TRANSITION_NAME);
};

/**
 * 標記下一次路由切換為向右返回的設定頁轉場。
 */
export const setNextSettingBackwardTransition = () => {
  setNextRouteTransitionName(SLIDE_RIGHT_TRANSITION_NAME);
};

/**
 * 提供根元件讀取目前路由轉場名稱。
 *
 * @returns 目前應套用於根層 `Transition` 的 name。
 */
export const useRouteTransitionName = () => routeTransitionName;

/**
 * 依明確標記或路由層級更新根路由轉場名稱。
 *
 * @param to - 即將顯示的目標路由。
 * @param from - 離開中的來源路由。
 */
export const updateRouteTransitionName = (
  to: RouteLocationNormalizedLoaded,
  from: RouteLocationNormalizedLoaded,
) => {
  const nextTransitionName =
    pendingRouteTransitionName ?? resolveRouteTransitionName(to, from);

  routeTransitionName.value = nextTransitionName;
  pendingRouteTransitionName = null;
};

const resolveRouteTransitionName = (
  to: RouteLocationNormalizedLoaded,
  from: RouteLocationNormalizedLoaded,
) => {
  const toName = String(to.name ?? "");
  const fromName = String(from.name ?? "");
  const toSettingDepth = SETTING_ROUTE_DEPTH.get(toName);
  const fromSettingDepth = SETTING_ROUTE_DEPTH.get(fromName);

  if (toSettingDepth && !fromSettingDepth) {
    return SLIDE_LEFT_TRANSITION_NAME;
  }

  if (toSettingDepth && fromSettingDepth) {
    return toSettingDepth >= fromSettingDepth
      ? SLIDE_LEFT_TRANSITION_NAME
      : SLIDE_RIGHT_TRANSITION_NAME;
  }

  if (DOCK_ROUTE_NAMES.has(toName) && fromName !== toName) {
    return DOCK_TRANSITION_NAME;
  }

  return DEFAULT_TRANSITION_NAME;
};
