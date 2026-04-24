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
    "解除配對後，你們的待辦與獎勵不會再同步。要繼續嗎？",
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
    <header class="app-page-header">
      <div class="app-page-header-row">
        <div class="min-w-[0px]">
          <div class="app-chip">設定</div>
          <h1 class="app-page-title mt-[12px] max-w-[11ch]">帳號設定</h1>
        </div>
      </div>

      <p class="app-page-summary">調整個人資料、提醒與配對。</p>
    </header>

    <section class="app-page-content app-section-stack flex-1">
      <section v-if="!getHasProfile" class="app-card app-card-section">
        <p class="app-label">目前狀態</p>
        <p class="app-status-title mt-[12px]">
          尚未取得使用者資料
        </p>
      </section>

      <template v-else>
        <section class="app-metric-grid">
          <article class="app-card app-card-section-sm">
            <p class="app-label">目前點數</p>
            <p class="app-metric-value mt-[8px]">
              {{ userStore.profile?.points ?? 0 }}
            </p>
          </article>

          <article class="app-card-muted app-card-section-sm">
            <p class="app-label">未讀通知</p>
            <p class="app-metric-value mt-[8px]">
              {{ getUnreadNotificationsText }}
            </p>
          </article>
        </section>

        <section class="app-card app-card-section">
          <div class="min-w-[0px]">
            <p class="app-label">個人資料</p>
            <p class="app-card-title mt-[8px]">顯示名稱</p>
          </div>

          <div class="mt-[20px]">
            <label class="app-field-stack block">
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
          </div>

          <dl class="settings-info-list mt-[16px]">
            <div class="settings-info-row">
              <dt class="settings-info-label">帳號</dt>
              <dd class="settings-info-value break-all">
                {{ userStore.profile?.email }}
              </dd>
            </div>

            <div class="settings-info-row">
              <dt class="settings-info-label">邀請碼</dt>
              <dd class="settings-info-value break-all tracking-[0.12em]">
                {{ userStore.profile?.inviteCode }}
              </dd>
            </div>

            <div class="settings-info-row">
              <dt class="settings-info-label">配對狀態</dt>
              <dd class="settings-info-value">
                {{ getHasPairedPartner ? "已配對" : "尚未配對" }}
              </dd>
            </div>
          </dl>

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

        <section class="app-card app-card-section">
          <div class="min-w-[0px]">
            <p class="app-label">通知與裝置</p>
            <p class="app-card-title mt-[8px]">通知入口</p>
          </div>

          <p class="app-card-caption mt-[16px]">
            查看通知列表與推播設定。
          </p>

          <dl class="settings-info-list mt-[16px]">
            <div class="settings-info-row">
              <dt class="settings-info-label">已綁定裝置</dt>
              <dd class="settings-info-value">
                {{ userStore.profile?.fcmTokens.length ?? 0 }}
              </dd>
            </div>
          </dl>

          <button
            class="app-ghost-button mt-[20px] w-full"
            type="button"
            @click="goToNotifications"
          >
            前往通知中心
          </button>
        </section>

        <section class="app-card app-card-section">
          <div class="min-w-[0px]">
            <p class="app-label">配對管理</p>
            <p class="app-card-title mt-[8px]">配對與登入</p>
          </div>

          <p class="app-card-caption mt-[16px]">
            解除配對後，你們的待辦與獎勵不會再同步。
          </p>

          <dl class="settings-info-list mt-[16px]">
            <div class="settings-info-row">
              <dt class="settings-info-label">目前狀態</dt>
              <dd class="settings-info-value">
                {{ getHasPairedPartner ? "已配對" : "未配對" }}
              </dd>
            </div>
          </dl>

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

<style scoped>
.settings-info-list {
  overflow: hidden;
  border: 1px solid var(--app-card-muted-border);
  border-radius: 1.35rem;
  background: var(--app-card-muted-bg);
  backdrop-filter: blur(10px);
}

.settings-info-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--app-space-16);
  margin: 0;
  padding: var(--app-space-12) var(--app-space-16);
}

.settings-info-row + .settings-info-row {
  border-top: 1px solid rgba(191, 206, 228, 0.52);
}

.settings-info-label {
  flex: 0 0 auto;
  color: var(--app-text-soft);
  font-size: var(--app-type-12);
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1.5rem;
}

.settings-info-value {
  min-width: 0;
  margin: 0;
  color: var(--app-text-strong);
  font-size: var(--app-type-15);
  font-weight: 600;
  line-height: 1.5rem;
  text-align: right;
}

@media (max-width: 420px) {
  .settings-info-row {
    flex-direction: column;
    gap: 0.35rem;
  }

  .settings-info-value {
    width: 100%;
    text-align: left;
  }
}
</style>
