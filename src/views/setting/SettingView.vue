<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Field } from "vant";
import MobileAppShell from "@/components/common/MobileAppShell.vue";
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
  } catch { }
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
    <header class="grid gap-[20px] px-[20px] pb-[24px] pt-[32px] sm:px-[28px] sm:pt-[40px]">
      <div class="flex items-start justify-between gap-[12px]">
        <div class="min-w-[0px]">
          <div class="inline-flex items-center gap-[8px] rounded-full border border-[var(--app-chip-border)] bg-[var(--app-chip-bg)] px-[12px] py-[8px] text-[13px] font-[700] leading-[1.2] tracking-[0.045em] text-[var(--app-chip-text)] shadow-[var(--app-shadow-chip)] backdrop-blur-[12px]">設定</div>
          <h1 class="text-[32px] font-[700] leading-[1.04] tracking-[-0.03em] text-[var(--app-text-strong)] mt-[12px] max-w-[11ch]">帳號設定</h1>
        </div>
      </div>

      <p class="max-w-[34ch] text-[16px] leading-[1.65] text-[var(--app-text-muted)]">管理個人資料、通知與配對狀態。</p>
    </header>

    <section class="px-[20px] pb-[24px] sm:px-[28px] grid gap-[16px] flex-1">
      <section v-if="!getHasProfile" class="rounded-[var(--app-radius-xl)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] backdrop-blur-[14px] p-[20px]">
        <p class="text-[13px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]">目前狀態</p>
        <p class="text-[20px] font-[700] leading-[1.24] tracking-[-0.02em] text-[var(--app-text-strong)] mt-[12px]">
          尚未取得使用者資料
        </p>
      </section>

      <template v-else>
        <section class="grid grid-cols-2 gap-[16px]">
          <article class="rounded-[var(--app-radius-xl)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] backdrop-blur-[14px] p-[16px]">
            <p class="text-[13px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]">目前點數</p>
            <p class="text-[28px] font-[700] leading-[1.02] tracking-[-0.03em] text-[var(--app-text-strong)] [font-variant-numeric:tabular-nums] mt-[8px]">
              {{ userStore.profile?.points ?? 0 }}
            </p>
          </article>

          <article class="rounded-[var(--app-radius-xl)] border border-[var(--app-card-muted-border)] bg-[image:var(--app-card-muted-bg)] backdrop-blur-[10px] p-[16px]">
            <p class="text-[13px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]">未讀通知</p>
            <p class="text-[28px] font-[700] leading-[1.02] tracking-[-0.03em] text-[var(--app-text-strong)] [font-variant-numeric:tabular-nums] mt-[8px]">
              {{ getUnreadNotificationsText }}
            </p>
          </article>
        </section>

        <section class="rounded-[var(--app-radius-xl)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] backdrop-blur-[14px] p-[20px]">
          <div class="min-w-[0px]">
            <p class="text-[13px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]">個人資料</p>
            <p class="text-[18px] font-[700] leading-[1.3] tracking-[-0.01em] text-[var(--app-text-strong)] mt-[8px]">顯示名稱</p>
          </div>

          <div class="mt-[20px]">
            <label class="grid gap-[8px] block">
              <span class="text-[15px] font-[600] text-[var(--app-text-muted)]">暱稱</span>
              <Field v-model="displayNameInput" class="w-full rounded-[1.35rem] border border-[var(--app-input-border)] bg-[var(--app-input-bg)] px-[16px] py-[0.95rem] text-[var(--app-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition-[border-color,box-shadow,background-color] duration-[180ms] after:hidden focus-within:border-[var(--app-input-focus-border)] focus-within:bg-[var(--app-input-focus-bg)] focus-within:shadow-[0_0_0_4px_var(--app-input-focus-ring),0_10px_28px_var(--app-input-focus-shadow)] [&_.van-field__body]:min-h-[24px] [&_.van-field__control]:text-[16px] [&_.van-field__control]:leading-6 [&_.van-field__control]:text-[var(--app-text)] [&_.van-field__control::placeholder]:text-[var(--app-input-placeholder)]" type="text" clearable :border="false"
                maxlength="40" placeholder="輸入新的暱稱" />
            </label>
          </div>

          <dl class="mt-[16px] overflow-hidden rounded-[1.35rem] border border-[var(--app-card-muted-border)] bg-[image:var(--app-card-muted-bg)] backdrop-blur-[10px]">
            <div class="m-[0px] flex items-start justify-between gap-[16px] px-[16px] py-[12px] max-[420px]:flex-col max-[420px]:gap-[0.35rem]">
              <dt class="flex-none text-[12px] font-[700] leading-6 tracking-[0.04em] text-[var(--app-text-soft)]">帳號</dt>
              <dd class="m-[0px] min-w-[0px] break-all text-right text-[15px] font-[600] leading-6 text-[var(--app-text-strong)] max-[420px]:w-full max-[420px]:text-left">
                {{ userStore.profile?.email }}
              </dd>
            </div>

            <div class="m-[0px] flex items-start justify-between gap-[16px] border-t border-[rgba(191,206,228,0.52)] px-[16px] py-[12px] max-[420px]:flex-col max-[420px]:gap-[0.35rem]">
              <dt class="flex-none text-[12px] font-[700] leading-6 tracking-[0.04em] text-[var(--app-text-soft)]">邀請碼</dt>
              <dd class="m-[0px] min-w-[0px] break-all text-right text-[15px] font-[600] leading-6 tracking-[0.12em] text-[var(--app-text-strong)] max-[420px]:w-full max-[420px]:text-left">
                {{ userStore.profile?.inviteCode }}
              </dd>
            </div>

            <div class="m-[0px] flex items-start justify-between gap-[16px] border-t border-[rgba(191,206,228,0.52)] px-[16px] py-[12px] max-[420px]:flex-col max-[420px]:gap-[0.35rem]">
              <dt class="flex-none text-[12px] font-[700] leading-6 tracking-[0.04em] text-[var(--app-text-soft)]">配對狀態</dt>
              <dd class="m-[0px] min-w-[0px] text-right text-[15px] font-[600] leading-6 text-[var(--app-text-strong)] max-[420px]:w-full max-[420px]:text-left">
                {{ getHasPairedPartner ? "已配對" : "尚未配對" }}
              </dd>
            </div>
          </dl>

          <button class="inline-flex items-center justify-center gap-[8px] rounded-full border border-[var(--app-button-secondary-border)] bg-[var(--app-button-secondary-bg)] px-[16px] py-[12px] text-[15px] font-[700] text-[var(--app-text)] shadow-[var(--app-shadow-chip)] transition-[transform,box-shadow,background-color,border-color,color] duration-[180ms] hover:enabled:-translate-y-[1px] focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--app-input-focus-ring),var(--app-shadow-chip)] disabled:cursor-not-allowed disabled:shadow-none disabled:opacity-55 mt-[20px] w-full" type="button" :disabled="!getCanSaveDisplayName"
            @click="handleSaveDisplayName">
            {{
              userStore.isUpdatingProfile || profileState.isSubmitting
                ? "儲存中..."
                : "儲存暱稱"
            }}
          </button>
        </section>

        <section class="rounded-[var(--app-radius-xl)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] backdrop-blur-[14px] p-[20px]">
          <div class="min-w-[0px]">
            <p class="text-[13px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]">通知與裝置</p>
            <p class="text-[18px] font-[700] leading-[1.3] tracking-[-0.01em] text-[var(--app-text-strong)] mt-[8px]">通知入口</p>
          </div>

          <p class="text-[15px] leading-[1.58] text-[var(--app-text-soft)] mt-[16px]">
            查看通知列表與推播設定。
          </p>

          <dl class="mt-[16px] overflow-hidden rounded-[1.35rem] border border-[var(--app-card-muted-border)] bg-[image:var(--app-card-muted-bg)] backdrop-blur-[10px]">
            <div class="m-[0px] flex items-start justify-between gap-[16px] px-[16px] py-[12px] max-[420px]:flex-col max-[420px]:gap-[0.35rem]">
              <dt class="flex-none text-[12px] font-[700] leading-6 tracking-[0.04em] text-[var(--app-text-soft)]">已綁定裝置</dt>
              <dd class="m-[0px] min-w-[0px] text-right text-[15px] font-[600] leading-6 text-[var(--app-text-strong)] max-[420px]:w-full max-[420px]:text-left">
                {{ userStore.profile?.fcmTokens.length ?? 0 }}
              </dd>
            </div>
          </dl>

          <button class="inline-flex items-center justify-center gap-[8px] rounded-full border border-[var(--app-button-ghost-border)] bg-[var(--app-button-ghost-bg)] px-[16px] py-[12px] text-[15px] font-[700] text-[var(--app-button-ghost-text)] transition-[transform,box-shadow,background-color,border-color,color] duration-[180ms] hover:enabled:-translate-y-[1px] focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--app-input-focus-ring),var(--app-shadow-chip)] disabled:cursor-not-allowed disabled:shadow-none disabled:opacity-55 mt-[20px] w-full" type="button" @click="goToNotifications">
            前往通知中心
          </button>
        </section>

        <section class="rounded-[var(--app-radius-xl)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] backdrop-blur-[14px] p-[20px]">
          <div class="min-w-[0px]">
            <p class="text-[13px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]">配對管理</p>
            <p class="text-[18px] font-[700] leading-[1.3] tracking-[-0.01em] text-[var(--app-text-strong)] mt-[8px]">配對與登入</p>
          </div>

          <p class="text-[15px] leading-[1.58] text-[var(--app-text-soft)] mt-[16px]">
            解除配對後，你們的待辦與獎勵不會再同步。
          </p>

          <dl class="mt-[16px] overflow-hidden rounded-[1.35rem] border border-[var(--app-card-muted-border)] bg-[image:var(--app-card-muted-bg)] backdrop-blur-[10px]">
            <div class="m-[0px] flex items-start justify-between gap-[16px] px-[16px] py-[12px] max-[420px]:flex-col max-[420px]:gap-[0.35rem]">
              <dt class="flex-none text-[12px] font-[700] leading-6 tracking-[0.04em] text-[var(--app-text-soft)]">目前狀態</dt>
              <dd class="m-[0px] min-w-[0px] text-right text-[15px] font-[600] leading-6 text-[var(--app-text-strong)] max-[420px]:w-full max-[420px]:text-left">
                {{ getHasPairedPartner ? "已配對" : "尚未配對" }}
              </dd>
            </div>
          </dl>

          <button class="inline-flex items-center justify-center gap-[8px] rounded-full border border-[var(--app-button-secondary-border)] bg-[var(--app-button-secondary-bg)] px-[16px] py-[12px] text-[15px] font-[700] text-[var(--app-text)] shadow-[var(--app-shadow-chip)] transition-[transform,box-shadow,background-color,border-color,color] duration-[180ms] hover:enabled:-translate-y-[1px] focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--app-input-focus-ring),var(--app-shadow-chip)] disabled:cursor-not-allowed disabled:shadow-none disabled:opacity-55 mt-[20px] w-full" type="button"
            :disabled="!getHasPairedPartner || coupleStore.isSubmitting" @click="handleUnpairCouple">
            {{ coupleStore.isSubmitting ? "解除配對中..." : "解除配對" }}
          </button>

          <button class="inline-flex items-center justify-center gap-[8px] rounded-full border border-[var(--app-button-ghost-border)] bg-[var(--app-button-ghost-bg)] px-[16px] py-[12px] text-[15px] font-[700] text-[var(--app-button-ghost-text)] transition-[transform,box-shadow,background-color,border-color,color] duration-[180ms] hover:enabled:-translate-y-[1px] focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--app-input-focus-ring),var(--app-shadow-chip)] disabled:cursor-not-allowed disabled:shadow-none disabled:opacity-55 mt-[12px] w-full" type="button" @click="handleSignOut">
            {{ authStore.isSubmitting ? "登出中..." : "登出帳號" }}
          </button>
        </section>
      </template>
    </section>
  </MobileAppShell>
</template>








