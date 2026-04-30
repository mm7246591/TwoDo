import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useErrorToast } from "@/composables/useErrorToast";
import { useAuthStore } from "@/pinia/auth";
import { useCoupleStore } from "@/pinia/couple";
import { useNotificationsStore } from "@/pinia/notifications";
import { useUserStore } from "@/pinia/user";
import {
  confirmDangerAction,
  showSuccessMessage,
} from "@/composables/useMessage";
import {
  setNextSettingBackwardTransition,
  setNextSettingForwardTransition,
} from "@/composables/useRouteTransition";
import { getUserProfile } from "@/services/userService";
import type { UserProfile } from "@/views/setting/types/interface";

type SettingDetailsTarget = "profile" | "partner";

interface SettingInfoField {
  label: string;
  value: string;
}

/**
 * 組裝設定頁需要的顯示資料、個人資料與夥伴設定介面、互動處理與點數說明彈窗顯示狀態。
 */
export const useSettingView = () => {
  const router = useRouter();
  const authStore = useAuthStore();
  const coupleStore = useCoupleStore();
  const notificationsStore = useNotificationsStore();
  const userStore = useUserStore();

  const displayNameInput = ref("");
  const activeDetailsTarget = ref<SettingDetailsTarget | null>(null);
  const detailsTransitionDirection = ref<"forward" | "backward">("forward");
  const isDarkModeEnabled = ref(false);
  const isEditingDisplayName = ref(false);
  const isPartnerProfileLoading = ref(false);
  const isPointsGuideDialogOpen = ref(false);
  const partnerProfile = ref<UserProfile | null>(null);
  const profileState = ref({
    isSubmitting: false,
  });

  const hasProfile = computed(() => Boolean(userStore.profile));
  const hasPairedPartner = computed(() =>
    Boolean(userStore.profile?.coupleId && userStore.profile?.partnerUid),
  );
  const displayName = computed(
    () => userStore.profile?.displayName || "TwoDo User",
  );
  const photoUrl = computed(() => userStore.profile?.photoURL);
  const partnerStatusText = computed(() => {
    if (!hasPairedPartner.value) return "尚未配對";
    return partnerProfile.value?.displayName
      ? `已與 ${partnerProfile.value.displayName} 配對`
      : "已與夥伴配對";
  });
  const connectionDays = computed(() => {
    const rawStartDate =
      coupleStore.currentCouple?.createdAt ?? userStore.profile?.createdAt;

    if (!rawStartDate) {
      return 0;
    }

    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const startDate = new Date(rawStartDate);
    startDate.setHours(0, 0, 0, 0);
    const dayInMilliseconds = 1000 * 60 * 60 * 24;

    return Math.max(
      1,
      Math.ceil((today.getTime() - startDate.getTime()) / dayInMilliseconds) +
        1,
    );
  });
  const connectionLabel = computed(() =>
    hasPairedPartner.value ? "在一起" : "使用天數",
  );
  const points = computed(() => userStore.profile?.points ?? 0);
  const unreadNotificationsText = computed(() =>
    String(notificationsStore.getUnreadCount),
  );
  const isUploadingAvatar = computed(() => userStore.isUpdatingProfile);
  const isCoupleSubmitting = computed(() => coupleStore.isSubmitting);
  const isSigningOut = computed(() => authStore.isSubmitting);
  const isSavingProfile = computed(
    () => userStore.isUpdatingProfile || profileState.value.isSubmitting,
  );
  const partnerButtonText = computed(() =>
    coupleStore.isSubmitting ? "處理中..." : "夥伴設定",
  );
  const detailsPanelTitle = computed(() =>
    activeDetailsTarget.value === "partner" ? "夥伴設定" : "個人資料",
  );
  const isPartnerDetailsMode = computed(
    () => activeDetailsTarget.value === "partner",
  );
  const detailsDisplayName = computed(() => {
    if (isPartnerDetailsMode.value) {
      return partnerProfile.value?.displayName || "尚未取得夥伴暱稱";
    }

    return displayName.value;
  });
  const partnerPrimaryActionText = computed(() =>
    hasPairedPartner.value ? "解除配對" : "前往配對",
  );
  const canShowDeleteAccount = computed(
    () => activeDetailsTarget.value === "profile",
  );
  const isDeletingAccount = computed(() => authStore.isSubmitting);
  const detailsTransitionEnterFromClass = computed(() =>
    detailsTransitionDirection.value === "forward"
      ? "translate-x-[32px] opacity-0"
      : "translate-x-[-32px] opacity-0",
  );
  const detailsTransitionLeaveToClass = computed(() =>
    detailsTransitionDirection.value === "forward"
      ? "translate-x-[-32px] opacity-0"
      : "translate-x-[32px] opacity-0",
  );
  const canSaveDisplayName = computed(() => {
    if (!userStore.profile || isSavingProfile.value) {
      return false;
    }

    const trimmedDisplayName = displayNameInput.value.trim();

    return (
      Boolean(trimmedDisplayName) &&
      trimmedDisplayName !== userStore.profile.displayName
    );
  });
  const activeDetailsFields = computed<SettingInfoField[]>(() => {
    if (isPartnerDetailsMode.value) {
      return buildUserProfileFields(partnerProfile.value);
    }

    return buildUserProfileFields(userStore.profile);
  });
  const detailsEmptyText = computed(() =>
    isPartnerDetailsMode.value
      ? "目前沒有夥伴資料可顯示。"
      : "目前沒有個人資料可顯示。",
  );

  const formatNullableText = (value?: string | null) => value?.trim() || "未設定";

  const buildUserProfileFields = (profile: UserProfile | null): SettingInfoField[] => {
    if (!profile) {
      return [];
    }

    return [
      {
        label: "Email",
        value: formatNullableText(profile.email),
      },
      {
        label: "邀請碼",
        value: formatNullableText(profile.inviteCode),
      },
    ];
  };

  watch(
    () => userStore.profile?.partnerUid ?? "",
    async (partnerUid) => {
      partnerProfile.value = null;

      if (!partnerUid) {
        isPartnerProfileLoading.value = false;
        return;
      }

      isPartnerProfileLoading.value = true;

      try {
        partnerProfile.value = await getUserProfile(partnerUid);
      } catch {
        partnerProfile.value = null;
      } finally {
        isPartnerProfileLoading.value = false;
      }
    },
    { immediate: true },
  );

  useErrorToast(() => authStore.errorMessage);
  useErrorToast(() => coupleStore.errorMessage);
  useErrorToast(() => userStore.errorMessage);

  /**
   * 返回上一個設定相關介面，並在切換前指定返回方向轉場。
   */
  const goBack = async () => {
    setNextSettingBackwardTransition();

    if (window.history.length > 1) {
      router.back();
      return;
    }

    await router.push({ name: "home" });
  };

  const goToNotifications = async () => {
    await router.push({ name: "notification" });
  };

  /**
   * 導向夥伴設定獨立頁，並在切換前指定設定頁推進轉場。
   */
  const goToPartnerDetails = async () => {
    setNextSettingForwardTransition();
    await router.push({ name: "setting-partner" });
  };

  /**
   * 導向個人資料獨立頁，並在切換前指定設定頁推進轉場。
   */
  const goToProfileDetails = async () => {
    setNextSettingForwardTransition();
    await router.push({ name: "setting-profile" });
  };

  const showPointsGuide = () => {
    isPointsGuideDialogOpen.value = true;
  };

  const openProfileDetails = () => {
    detailsTransitionDirection.value = "backward";
    activeDetailsTarget.value = "profile";
    isEditingDisplayName.value = false;
  };

  const openPartnerDetails = () => {
    detailsTransitionDirection.value = "forward";
    activeDetailsTarget.value = "partner";
    isEditingDisplayName.value = false;
  };

  const openDisplayNameEdit = () => {
    isEditingDisplayName.value = true;
  };

  const cancelDisplayNameEdit = () => {
    displayNameInput.value = userStore.profile?.displayName ?? "";
    isEditingDisplayName.value = false;
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      await userStore.saveProfilePhoto(file);
      showSuccessMessage("頭像已更新");
    } catch { }
  };

  const handleThemeToggle = (value: boolean) => {
    isDarkModeEnabled.value = value;
    document.documentElement.classList.toggle("dark", value);
  };

  const handleSaveDisplayName = async () => {
    if (!canSaveDisplayName.value) {
      return;
    }

    profileState.value.isSubmitting = true;

    try {
      await userStore.saveDisplayName(displayNameInput.value);
      isEditingDisplayName.value = false;
      showSuccessMessage("暱稱已更新");
    } catch {
    } finally {
      profileState.value.isSubmitting = false;
    }
  };

  const handleUnpairCouple = async () => {
    if (!hasPairedPartner.value || coupleStore.isSubmitting) {
      return;
    }

    const shouldContinue = await confirmDangerAction(
      "解除配對後，你們的待辦、獎勵與點數將不再同步。確定要解除配對嗎？",
      "解除配對",
    );

    if (!shouldContinue) {
      return;
    }

    try {
      await coupleStore.unpairCurrentCouple();
      showSuccessMessage("已解除配對");
    } catch { }
  };

  const handlePartnerSettings = async () => {
    if (hasPairedPartner.value) {
      await handleUnpairCouple();
      return;
    }

    await router.push({ name: "pairing" });
  };

  const handleDeleteAccount = async () => {
    const shouldContinue = await confirmDangerAction(
      "刪除帳號後將無法使用此登入帳號進入 TwoDo。確定要刪除帳號嗎？",
      "刪除帳號",
    );

    if (!shouldContinue) {
      return;
    }

    try {
      await authStore.deleteCurrentAccount();
      showSuccessMessage("帳號已刪除");
      await router.push({ name: "login" });
    } catch { }
  };

  const handleSignOut = async () => {
    try {
      await authStore.signOutUser();
      showSuccessMessage("已登出帳號");
      await router.push({ name: "login" });
    } catch { }
  };

  return {
    activeDetailsFields,
    activeDetailsTarget,
    cancelDisplayNameEdit,
    canShowDeleteAccount,
    canSaveDisplayName,
    connectionDays,
    connectionLabel,
    detailsDisplayName,
    detailsEmptyText,
    detailsPanelTitle,
    detailsTransitionEnterFromClass,
    detailsTransitionLeaveToClass,
    displayName,
    displayNameInput,
    goBack,
    goToNotifications,
    goToPartnerDetails,
    goToProfileDetails,
    handleAvatarUpload,
    handleDeleteAccount,
    handlePartnerSettings,
    handleSaveDisplayName,
    handleSignOut,
    handleThemeToggle,
    hasProfile,
    isCoupleSubmitting,
    isDarkModeEnabled,
    isEditingDisplayName,
    isDeletingAccount,
    isPartnerDetailsMode,
    isPartnerProfileLoading,
    partnerProfile,
    isPointsGuideDialogOpen,
    isSavingProfile,
    isSigningOut,
    isUploadingAvatar,
    openDisplayNameEdit,
    openPartnerDetails,
    openProfileDetails,
    partnerButtonText,
    partnerPrimaryActionText,
    partnerStatusText,
    photoUrl,
    points,
    showPointsGuide,
    unreadNotificationsText,
  };
};
