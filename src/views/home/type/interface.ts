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

type HomeTaskBadgeTone = "accent" | "success";

interface HomeHeroStatItem {
  icon: HomeDashboardIconName;
  label: string;
  value: number | string;
}

interface HomeTaskItem {
  badge: string;
  badgeTone: HomeTaskBadgeTone;
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
  HomeHeroStatItem,
  HomeTaskItem,
  HomePanelMetric,
  HomePanelAction,
  HomeEmptyStateContent,
  HomeActivityItem,
};
