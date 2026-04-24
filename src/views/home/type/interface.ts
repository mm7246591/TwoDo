type HomeDashboardRouteName =
  | "notifications"
  | "pairing"
  | "points"
  | "rewards"
  | "settings"
  | "tasks";

type HomeDashboardIconName =
  | "activity"
  | "add"
  | "bell"
  | "gift"
  | "heart-link"
  | "points"
  | "settings"
  | "shield-check"
  | "tasks";

type HomeTaskBadgeTone = "accent" | "neutral" | "success";

interface HomeTaskItem {
  badge: string;
  badgeTone: HomeTaskBadgeTone;
  canComplete?: boolean;
  canConfirm?: boolean;
  description: string;
  id: string;
  title: string;
}

interface HomePanelMetric {
  label: string;
  value: number | string;
}

interface HomePanelAction {
  icon: HomeDashboardIconName;
  label: string;
  routeName: HomeDashboardRouteName;
}

interface HomeEmptyStateContent {
  description: string;
  title: string;
}

interface HomeActivityItem {
  createdAt: Date;
  description: string;
  icon: HomeDashboardIconName;
  id: string;
  label: string;
  timestampLabel: string;
}

export type {
  HomeDashboardRouteName,
  HomeDashboardIconName,
  HomeTaskBadgeTone,
  HomeTaskItem,
  HomePanelMetric,
  HomePanelAction,
  HomeEmptyStateContent,
  HomeActivityItem,
};
