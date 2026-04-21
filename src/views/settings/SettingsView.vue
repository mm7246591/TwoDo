<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Field } from "vant";
import MobileAppShell from "@/components/MobileAppShell.vue";
import { useErrorToast } from "@/composables/useErrorToast";
import { useAuthStore } from "@/pinia/auth";
import { useCoupleStore } from "@/pinia/couple";
import { useNotificationsStore } from "@/pinia/notifications";
import { useUserStore } from "@/pinia/user";
import {
  confirmDangerAction,
  showSuccessMessage,
} from "@/services/uiFeedback";

const router = useRouter();
const authStore = useAuthStore();
const coupleStore = useCoupleStore();
const notificationsStore = useNotificationsStore();
const userStore = useUserStore();

const displayNameInput = ref("");
const profileState = ref({
  isSubmitting: false,
});

const getHasProfile = computed(() => Boolean(userStore.profile));
const getHasPairedPartner = computed(() =>
  Boolean(userStore.profile?.coupleId && userStore.profile?.partnerUid),
);
const getUnreadNotificationsText = computed(() =>
  String(notificationsStore.getUnreadCount),
);
const getCanSaveDisplayName = computed(() => {
  if (
    !userStore.profile ||
    profileState.value.isSubmitting ||
    userStore.isUpdatingProfile
  ) {
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

const goHome = async () => {
  await router.push({ name: "home" });
};

const goToNotifications = async () => {
  await router.push({ name: "notifications" });
};

const handleSaveDisplayName = async () => {
  if (!getCanSaveDisplayName.value) {
    return;
  }

  profileState.value.isSubmitting = true;

  try {
    await userStore.saveDisplayName(displayNameInput.value);
    showSuccessMessage("暱稱已更新");
  } catch {
  } finally {
    profileState.value.isSubmitting = false;
  }
};

const handleUnpairCouple = async () => {
  if (!getHasPairedPartner.value || coupleStore.isSubmitting) {
    return;
  }

  const shouldContinue = await confirmDangerAction(
    "解除配對後，雙方目前的 couple 綁定會被移除。要繼續嗎？",
    "解除配對",
  );

  if (!shouldContinue) {
    return;
  }

  try {
    await coupleStore.unpairCurrentCouple();
    showSuccessMessage("已解除配對");
  } catch {}
};

const handleSignOut = async () => {
  try {
    await authStore.signOutUser();
    showSuccessMessage("已登出帳號");
    await router.push({ name: "login" });
  } catch {}
};

watch(
  () => userStore.profile?.displayName ?? "",
  (displayName) => {
    displayNameInput.value = displayName;
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
</script>

<template>
  <MobileAppShell>
    <header
      class="space-y-[20px] px-[20px] pb-[24px] pt-[32px] sm:px-[28px] sm:pt-[40px]"
    >
      <div class="flex items-start justify-between gap-[12px]">
        <div class="min-w-0">
          <div class="app-chip">設定</div>
          <h1
            class="app-text-strong mt-[16px] max-w-[12ch] text-[34px] font-semibold leading-[1.04] tracking-[-0.045em]"
          >
            個人設定與配對管理
          </h1>
        </div>

        <button
          class="app-ghost-button shrink-0 px-[16px] py-[12px] text-[14px]"
          type="button"
          @click="goHome"
        >
          返回首頁
        </button>
      </div>

      <p class="app-text-muted max-w-[34ch] text-[14px] leading-[24px]">
        管理你的暱稱、通知設定、配對狀態與帳號操作。
      </p>
    </header>

    <section class="flex-1 space-y-[16px] px-[20px] pb-[24px] sm:px-[28px]">
      <section v-if="!getHasProfile" class="app-card px-[20px] py-[20px]">
        <p class="app-label">目前狀態</p>
        <p
          class="app-text-strong mt-[12px] text-[24px] font-semibold tracking-[-0.04em]"
        >
          尚未取得使用者資料
        </p>
      </section>

      <template v-else>
        <section class="grid grid-cols-2 gap-[16px]">
          <article class="app-card px-[16px] py-[16px]">
            <p class="app-label">目前點數</p>
            <p class="app-text-strong mt-[8px] text-[30px] font-semibold">
              {{ userStore.profile?.points ?? 0 }}
            </p>
          </article>

          <article class="app-card-muted px-[16px] py-[16px]">
            <p class="app-label">未讀通知</p>
            <p class="app-text-strong mt-[8px] text-[30px] font-semibold">
              {{ getUnreadNotificationsText }}
            </p>
          </article>
        </section>

        <section class="app-card px-[20px] py-[20px]">
          <div class="flex items-center justify-between gap-[12px]">
            <div>
              <p class="app-label">個人資料</p>
              <p
                class="app-text-strong mt-[8px] text-[24px] font-semibold tracking-[-0.04em]"
              >
                更新你的顯示名稱
              </p>
            </div>

            <div class="app-accent-panel px-[12px] py-[8px] text-right">
              <p class="app-kicker">帳號</p>
              <p class="app-text-strong mt-[4px] text-[14px] font-semibold">
                {{ userStore.profile?.email }}
              </p>
            </div>
          </div>

          <label class="mt-[20px] block space-y-[8px]">
            <span class="app-field-label">暱稱</span>
            <Field
              v-model="displayNameInput"
              class="app-vant-field"
              type="text"
              clearable
              :border="false"
              maxlength="40"
              placeholder="輸入新的暱稱"
            />
          </label>

          <div class="mt-[16px] grid grid-cols-2 gap-[16px]">
            <article class="app-card-muted px-[16px] py-[16px]">
              <p class="app-label">邀請碼</p>
              <p
                class="app-text-strong mt-[8px] text-[18px] font-semibold tracking-[0.12em]"
              >
                {{ userStore.profile?.inviteCode }}
              </p>
            </article>

            <article class="app-card-muted px-[16px] py-[16px]">
              <p class="app-label">配對狀態</p>
              <p class="app-text-strong mt-[8px] text-[18px] font-semibold">
                {{ getHasPairedPartner ? "已配對" : "尚未配對" }}
              </p>
            </article>
          </div>

          <button
            class="app-secondary-button mt-[20px] w-full"
            type="button"
            :disabled="!getCanSaveDisplayName"
            @click="handleSaveDisplayName"
          >
            {{
              userStore.isUpdatingProfile || profileState.isSubmitting
                ? "儲存中..."
                : "儲存暱稱"
            }}
          </button>
        </section>

        <section class="app-card px-[20px] py-[20px]">
          <div class="flex items-center justify-between gap-[12px]">
            <div>
              <p class="app-label">通知與裝置</p>
              <p
                class="app-text-strong mt-[8px] text-[24px] font-semibold tracking-[-0.04em]"
              >
                查看推播與站內通知
              </p>
            </div>

            <div class="app-accent-panel px-[12px] py-[8px] text-right">
              <p class="app-kicker">已綁定裝置</p>
              <p class="app-text-strong mt-[4px] text-[14px] font-semibold">
                {{ userStore.profile?.fcmTokens.length ?? 0 }}
              </p>
            </div>
          </div>

          <p class="app-text-muted mt-[16px] text-[14px] leading-[24px]">
            你可以到通知頁管理這台裝置的推播狀態，也能直接檢查未讀通知與站內訊息列表。
          </p>

          <button
            class="app-ghost-button mt-[20px] w-full"
            type="button"
            @click="goToNotifications"
          >
            前往通知設定
          </button>
        </section>

        <section class="app-card px-[20px] py-[20px]">
          <div class="flex items-center justify-between gap-[12px]">
            <div>
              <p class="app-label">配對管理</p>
              <p
                class="app-text-strong mt-[8px] text-[24px] font-semibold tracking-[-0.04em]"
              >
                配對與帳號操作
              </p>
            </div>

            <div class="app-accent-panel px-[12px] py-[8px] text-right">
              <p class="app-kicker">目前狀態</p>
              <p class="app-text-strong mt-[4px] text-[14px] font-semibold">
                {{ getHasPairedPartner ? "已配對" : "未配對" }}
              </p>
            </div>
          </div>

          <p class="app-text-muted mt-[16px] text-[14px] leading-[24px]">
            解除配對後，你們會停止共享任務、獎勵與通知。既有紀錄會保留，但不會再出現在目前帳號的共享空間中。
          </p>

          <button
            class="app-secondary-button mt-[20px] w-full"
            type="button"
            :disabled="!getHasPairedPartner || coupleStore.isSubmitting"
            @click="handleUnpairCouple"
          >
            {{ coupleStore.isSubmitting ? "解除配對中..." : "解除配對" }}
          </button>

          <button
            class="app-ghost-button mt-[12px] w-full"
            type="button"
            @click="handleSignOut"
          >
            {{ authStore.isSubmitting ? "登出中..." : "登出帳號" }}
          </button>
        </section>
      </template>
    </section>
  </MobileAppShell>
</template>
