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
} from "@/services/uiFeedback";

/**
 * 組裝設定頁需要的顯示資料、互動處理與點數說明彈窗顯示狀態。
 */
export const useSettingView = () => {
  const router = useRouter();
  const authStore = useAuthStore();
  const coupleStore = useCoupleStore();
  const notificationsStore = useNotificationsStore();
  const userStore = useUserStore();

  const displayNameInput = ref("");
  const isDarkModeEnabled = ref(false);
  const isPointsGuideDialogOpen = ref(false);
  const isProfileEditorOpen = ref(false);
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
  const partnerStatusText = computed(() =>
    hasPairedPartner.value ? "已與夥伴配對" : "尚未配對",
  );
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
    coupleStore.isSubmitting ? "解除配對中..." : "夥伴設定",
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

  useErrorToast(() => authStore.errorMessage);
  useErrorToast(() => coupleStore.errorMessage);
  useErrorToast(() => userStore.errorMessage);

  const goBack = async () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    await router.push({ name: "home" });
  };

  const goToNotifications = async () => {
    await router.push({ name: "notification" });
  };

  const showPointsGuide = () => {
    isPointsGuideDialogOpen.value = true;
  };

  const toggleProfileEditor = () => {
    isProfileEditorOpen.value = !isProfileEditorOpen.value;
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
      isProfileEditorOpen.value = false;
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

  const handleSignOut = async () => {
    try {
      await authStore.signOutUser();
      showSuccessMessage("已登出帳號");
      await router.push({ name: "login" });
    } catch { }
  };

  watch(
    () => userStore.profile?.displayName ?? "",
    (nextDisplayName) => {
      displayNameInput.value = nextDisplayName;
    },
    { immediate: true },
  );

  watch(
    () => ({
      coupleId: userStore.profile?.coupleId ?? "",
      uid: userStore.profile?.uid ?? "",
    }),
    ({ coupleId, uid }) => {
      if (!coupleId || !uid) {
        notificationsStore.reset();
        return;
      }

      void notificationsStore.syncNotifications(uid, coupleId);
    },
    { immediate: true },
  );

  return {
    canSaveDisplayName,
    connectionDays,
    connectionLabel,
    displayName,
    displayNameInput,
    goBack,
    goToNotifications,
    handleAvatarUpload,
    handlePartnerSettings,
    handleSaveDisplayName,
    handleSignOut,
    handleThemeToggle,
    hasProfile,
    isCoupleSubmitting,
    isDarkModeEnabled,
    isPointsGuideDialogOpen,
    isProfileEditorOpen,
    isSavingProfile,
    isSigningOut,
    isUploadingAvatar,
    partnerButtonText,
    partnerStatusText,
    photoUrl,
    points,
    showPointsGuide,
    toggleProfileEditor,
    unreadNotificationsText,
  };
};
