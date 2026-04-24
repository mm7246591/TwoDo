<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useErrorToast } from "@/composables/useErrorToast";
import { useCoupleStore } from "@/pinia/couple";
import { useUserStore } from "@/pinia/user";
import { showErrorMessage, showSuccessMessage } from "@/services/uiFeedback";

const userStore = useUserStore();
const coupleStore = useCoupleStore();
const router = useRouter();

const inviteCodeInput = ref("");
const isCopying = ref(false);

useErrorToast(() => coupleStore.errorMessage);

const myInviteCode = computed(() => userStore.profile?.inviteCode ?? "");
const hasInviteCode = computed(() => myInviteCode.value.length > 0);
const hasPartner = computed(() => Boolean(userStore.profile?.partnerUid));

const canJoinInvite = computed(
  () =>
    Boolean(userStore.profile?.uid) &&
    inviteCodeInput.value.trim().length >= 6 &&
    !coupleStore.isSubmitting,
);

const statusMessage = computed(() => {
  if (coupleStore.isSubmitting) {
    return "配對中...";
  }

  if (hasPartner.value) {
    return "已連線，你們的小窩準備好了。";
  }

  return "正在等待夥伴連線...";
});

const handleInviteCodeInput = (event: Event) => {
  const target = event.target as HTMLInputElement | null;

  if (!target) {
    return;
  }

  inviteCodeInput.value = target.value.toUpperCase();
};

const handleCopyInviteCode = async () => {
  if (!hasInviteCode.value || isCopying.value) {
    return;
  }

  isCopying.value = true;

  try {
    await navigator.clipboard.writeText(myInviteCode.value);
    showSuccessMessage("邀請碼已複製");
  } catch {
    showErrorMessage("複製失敗，請手動複製。");
  } finally {
    isCopying.value = false;
  }
};

watch(
  () => userStore.profile?.hasSeenPairingOnboarding,
  (hasSeenPairingOnboarding) => {
    if (hasSeenPairingOnboarding === false) {
      void userStore.markPairingOnboardingAsSeen();
    }
  },
  { immediate: true },
);

const handleJoinInvite = async () => {
  if (!userStore.profile?.uid || !canJoinInvite.value) {
    return;
  }

  try {
    await coupleStore.joinByInviteCode(
      userStore.profile.uid,
      inviteCodeInput.value,
    );
    inviteCodeInput.value = "";
    showSuccessMessage("配對成功");
    await router.push({ name: "home" });
  } catch {
    // coupleStore.errorMessage 會透過 useErrorToast 顯示
  }
};

const handleSkipToHome = async () => {
  await router.push({ name: "home" });
};
</script>

<template>
  <main
    class="relative flex min-h-[max(884px,100dvh)] items-center justify-center overflow-hidden bg-background p-margin-mobile font-['Plus_Jakarta_Sans'] text-on-background md:p-margin-desktop"
  >
    <div class="pointer-events-none absolute inset-[0px] z-0">
      <div
        class="absolute inset-[0px] bg-gradient-to-t from-background via-background/95 to-background/60"
      />
    </div>

    <section class="relative z-10 w-full max-w-[420px]">
      <div class="mb-lg flex justify-center">
        <div
          class="flex h-[64px] w-[64px] items-center justify-center rounded-full border border-surface-container bg-surface-container-lowest shadow-[0_4px_20px_rgba(148,72,53,0.08)]"
        >
          <span
            class="material-symbols-outlined fill text-[30px] text-primary"
            aria-hidden="true"
            >favorite</span
          >
        </div>
      </div>

      <div
        class="rounded-3xl border border-white/50 bg-surface-container-lowest p-lg shadow-[0_8px_30px_-4px_rgba(148,72,53,0.12)] backdrop-blur-sm"
      >
        <header class="mb-lg text-center">
          <h1 class="mb-sm font-headline-lg text-headline-lg text-primary">
            加入你們的小窩
          </h1>
          <p class="m-0 font-body-md text-body-md text-on-surface-variant">
            與另一半連線，開始分享任務、清單與生活的點滴。
          </p>
        </header>

        <section
          class="group relative mb-md overflow-hidden rounded-2xl bg-surface-container p-md"
        >
          <div
            class="absolute right-[0px] top-[0px] -mr-[64px] -mt-[64px] h-[128px] w-[128px] rounded-full bg-primary-fixed/30 blur-2xl transition-transform group-hover:scale-110"
            aria-hidden="true"
          />
          <p
            class="relative z-10 mb-sm font-label-sm text-label-sm text-on-surface-variant"
          >
            你的邀請碼
          </p>
          <div class="relative z-10 flex items-center justify-between gap-md">
            <div
              class="font-headline-md text-headline-md font-bold tracking-[0.2em] text-on-surface"
            >
              {{ myInviteCode || "--------" }}
            </div>
            <button
              aria-label="複製邀請碼"
              class="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-white/50 text-primary shadow-sm transition-colors hover:bg-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              :disabled="!hasInviteCode || isCopying"
              @click="handleCopyInviteCode"
            >
              <span
                class="material-symbols-outlined text-[20px]"
                aria-hidden="true"
                >content_copy</span
              >
            </button>
          </div>
        </section>

        <div class="my-md flex items-center gap-md">
          <div class="h-px flex-1 bg-outline-variant" />
          <span
            class="font-label-sm text-label-sm uppercase tracking-widest text-outline"
            >或</span
          >
          <div class="h-px flex-1 bg-outline-variant" />
        </div>

        <section class="mb-lg">
          <label
            class="mb-sm block font-label-sm text-label-sm text-on-surface-variant"
            for="partner-code"
          >
            我有邀請碼
          </label>
          <input
            id="partner-code"
            class="w-full rounded-lg border border-transparent bg-surface-container px-md py-sm font-body-md text-body-md text-on-surface outline-none ring-[0px] transition-[background-color,box-shadow] duration-200 placeholder:text-outline/60 focus:border-transparent focus:bg-surface-container-lowest focus:shadow-[0_4px_12px_rgba(255,158,133,0.15)] focus:outline-none focus:ring-[2px] focus:ring-primary-container focus:ring-offset-[0px] focus-visible:outline-none"
            :value="inviteCodeInput"
            placeholder="輸入邀請碼"
            type="text"
            autocomplete="off"
            @input="handleInviteCodeInput"
          />
        </section>

        <button
          class="flex w-full items-center justify-center gap-base rounded-xl bg-primary px-md py-[14px] font-label-md text-label-md text-on-primary shadow-[0_4px_14px_rgba(148,72,53,0.25)] transition-transform hover:shadow-[0_6px_20px_rgba(148,72,53,0.3)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          :disabled="!canJoinInvite"
          @click="handleJoinInvite"
        >
          <span class="material-symbols-outlined text-[20px]" aria-hidden="true"
            >link</span
          >
          {{ coupleStore.isSubmitting ? "配對中..." : "立即連線" }}
        </button>

        <p
          class="m-0 mt-md text-center font-label-sm text-label-sm text-on-surface-variant opacity-70"
        >
          {{ statusMessage }}
        </p>
      </div>

      <button
        class="mt-md flex w-full items-center justify-center gap-xs rounded-xl border-none bg-transparent px-md py-sm font-label-md text-label-md text-on-surface-variant transition-colors hover:text-primary"
        type="button"
        @click="handleSkipToHome"
      >
        {{ hasPartner ? "進入首頁" : "稍後再配對，先進入首頁" }}
        <span class="material-symbols-outlined text-[20px]" aria-hidden="true"
          >arrow_forward</span
        >
      </button>
    </section>
  </main>
</template>
