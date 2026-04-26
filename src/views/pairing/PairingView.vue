<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import MobileAppShell from '@/components/common/MobileAppShell.vue'
import { useErrorToast } from '@/composables/useErrorToast'
import { useCoupleStore } from '@/pinia/couple'
import { useUserStore } from '@/pinia/user'
import { showErrorMessage, showSuccessMessage } from '@/services/uiFeedback'

const userStore = useUserStore()
const coupleStore = useCoupleStore()
const router = useRouter()

const inviteCodeInput = ref('')
const isCopying = ref(false)
const isFirstPairingEntry = ref(false)

useErrorToast(() => coupleStore.errorMessage)

const myInviteCode = computed(() => userStore.profile?.inviteCode ?? '')
const hasInviteCode = computed(() => myInviteCode.value.length > 0)
const hasPartner = computed(() => Boolean(userStore.profile?.partnerUid))

const canJoinInvite = computed(
  () => Boolean(userStore.profile?.uid) && inviteCodeInput.value.trim().length >= 6 && !coupleStore.isSubmitting,
)

const statusMessage = computed(() => {
  if (coupleStore.isSubmitting) {
    return '處理中...'
  }

  if (hasPartner.value) {
    return '你已經完成配對，可以回到首頁繼續使用'
  }

  return '輸入對方的邀請碼，或把你的邀請碼分享給對方'
})

const shouldShowStatusMessage = computed(
  () => coupleStore.isSubmitting || hasPartner.value || isFirstPairingEntry.value,
)
const shouldShowSkipToHome = computed(() => isFirstPairingEntry.value)
const shouldShowInviteForm = computed(() => !hasPartner.value)

const handleInviteCodeInput = (event: Event) => {
  const target = event.target as HTMLInputElement | null

  if (!target) {
    return
  }

  inviteCodeInput.value = target.value.toUpperCase()
}

const handleCopyInviteCode = async () => {
  if (!hasInviteCode.value || isCopying.value) {
    return
  }

  isCopying.value = true

  try {
    await navigator.clipboard.writeText(myInviteCode.value)
    showSuccessMessage('邀請碼已複製')
  } catch {
    showErrorMessage('複製失敗，請再試一次')
  } finally {
    isCopying.value = false
  }
}

watch(
  () => userStore.profile?.hasSeenPairingOnboarding,
  (hasSeenPairingOnboarding) => {
    if (hasSeenPairingOnboarding === false) {
      isFirstPairingEntry.value = true
      void userStore.markPairingOnboardingAsSeen()
    }
  },
  { immediate: true },
)

const handleJoinInvite = async () => {
  if (!userStore.profile?.uid || !canJoinInvite.value) {
    return
  }

  try {
    await coupleStore.joinByInviteCode(userStore.profile.uid, inviteCodeInput.value)
    inviteCodeInput.value = ''
    showSuccessMessage('配對成功')
    await router.push({ name: 'home' })
  } catch {
    // The store error is shown through useErrorToast.
  }
}

const handleSkipToHome = async () => {
  await router.push({ name: 'home' })
}
</script>

<template>
  <MobileAppShell>
    <section
      class="px-[20px] pb-[24px] sm:px-[28px] relative flex flex-1 items-center justify-center overflow-hidden py-[24px] font-['Plus_Jakarta_Sans'] text-[var(--auth-on-background)]"
    >
      <div class="pointer-events-none absolute inset-[0px] z-0">
        <div
          class="absolute inset-[0px] bg-gradient-to-t from-[var(--auth-background)] via-[color:color-mix(in_srgb,var(--auth-background)_95%,transparent)] to-[color:color-mix(in_srgb,var(--auth-background)_60%,transparent)]"
        />
      </div>

      <section class="relative z-10 w-full max-w-[420px]">
        <div
          class="rounded-3xl border border-white/50 bg-[var(--auth-surface-container-lowest)] p-[40px] shadow-[0_8px_30px_-4px_rgba(148,72,53,0.12)] backdrop-blur-sm"
        >
          <header class="mb-[40px] text-center">
            <h1
              class="mb-[12px] font-['Plus_Jakarta_Sans'] text-[32px] font-[700] leading-[40px] text-[var(--auth-primary)]"
            >
              加入你們的小窩
            </h1>
            <p
              class="m-[0px] font-['Plus_Jakarta_Sans'] text-[16px] font-[400] leading-[24px] text-[var(--auth-on-surface-variant)]"
            >
              與另一半連線，開始分享任務、清單與生活的點滴。
            </p>
          </header>

          <section class="group relative mb-[24px] overflow-hidden rounded-2xl bg-[var(--auth-surface-container)] p-[24px]">
            <div
              class="absolute right-[0px] top-[0px] -mr-[64px] -mt-[64px] h-[128px] w-[128px] rounded-full bg-[color:color-mix(in_srgb,var(--auth-primary-fixed)_30%,transparent)] blur-2xl transition-transform group-hover:scale-110"
              aria-hidden="true"
            />
            <p
              class="relative z-10 mb-[12px] font-['Plus_Jakarta_Sans'] text-[12px] font-[500] leading-[16px] text-[var(--auth-on-surface-variant)]"
            >
              你的邀請碼
            </p>
            <div class="relative z-10 flex items-center justify-between gap-[24px]">
              <div
                class="font-['Plus_Jakarta_Sans'] text-[24px] font-[700] leading-[32px] tracking-[0.2em] text-[var(--auth-on-surface)]"
              >
                {{ myInviteCode || '--------' }}
              </div>
              <button
                aria-label="複製邀請碼"
                class="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-white/50 text-[var(--auth-primary)] shadow-sm transition-colors hover:bg-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                :disabled="!hasInviteCode || isCopying"
                @click="handleCopyInviteCode"
              >
                <span class="material-symbols-outlined text-[20px]" aria-hidden="true">content_copy</span>
              </button>
            </div>
          </section>

          <div v-if="shouldShowInviteForm" class="my-[24px] flex items-center gap-[24px]">
            <div class="h-px flex-1 bg-[var(--auth-outline-variant)]" />
            <span
              class="font-['Plus_Jakarta_Sans'] text-[12px] font-[500] uppercase leading-[16px] tracking-widest text-[var(--auth-outline)]"
            >
              或
            </span>
            <div class="h-px flex-1 bg-[var(--auth-outline-variant)]" />
          </div>

          <section v-if="shouldShowInviteForm" class="mb-[40px]">
            <label
              class="mb-[12px] block font-['Plus_Jakarta_Sans'] text-[12px] font-[500] leading-[16px] text-[var(--auth-on-surface-variant)]"
              for="partner-code"
            >
              邀請碼
            </label>
            <input
              id="partner-code"
              class="w-full rounded-lg border border-transparent bg-[var(--auth-surface-container)] px-[24px] py-[12px] font-['Plus_Jakarta_Sans'] text-[16px] font-[400] leading-[24px] text-[var(--auth-on-surface)] outline-none ring-[0px] transition-[background-color,box-shadow] duration-200 placeholder:text-[color:color-mix(in_srgb,var(--auth-outline)_60%,transparent)] focus:border-transparent focus:bg-[var(--auth-surface-container-lowest)] focus:shadow-[0_4px_12px_rgba(255,158,133,0.15)] focus:outline-none focus:ring-[2px] focus:ring-[var(--auth-primary-container)] focus:ring-offset-[0px] focus-visible:outline-none"
              :value="inviteCodeInput"
              placeholder="輸入邀請碼"
              type="text"
              autocomplete="off"
              @input="handleInviteCodeInput"
            />
          </section>

          <button
            v-if="shouldShowInviteForm"
            class="flex w-full items-center justify-center gap-[8px] rounded-xl bg-[var(--auth-primary)] px-[24px] py-[14px] font-['Plus_Jakarta_Sans'] text-[14px] font-[600] leading-[20px] tracking-[0.01em] text-[var(--auth-on-primary)] shadow-[0_4px_14px_rgba(148,72,53,0.25)] transition-transform hover:shadow-[0_6px_20px_rgba(148,72,53,0.3)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            :disabled="!canJoinInvite"
            @click="handleJoinInvite"
          >
            <span class="material-symbols-outlined text-[20px]" aria-hidden="true">link</span>
            {{ coupleStore.isSubmitting ? '配對中...' : '立即連線' }}
          </button>

          <p
            v-if="shouldShowStatusMessage"
            class="m-[0px] mt-[24px] text-center font-['Plus_Jakarta_Sans'] text-[12px] font-[500] leading-[16px] text-[var(--auth-on-surface-variant)] opacity-70"
          >
            {{ statusMessage }}
          </p>
        </div>

        <button
          v-if="shouldShowSkipToHome"
          class="mt-[24px] flex w-full items-center justify-center gap-[4px] rounded-xl border-none bg-transparent px-[24px] py-[12px] font-['Plus_Jakarta_Sans'] text-[14px] font-[600] leading-[20px] tracking-[0.01em] text-[var(--auth-on-surface-variant)] transition-colors hover:text-[var(--auth-primary)]"
          type="button"
          @click="handleSkipToHome"
        >
          {{ hasPartner ? '進入首頁' : '稍後再配對，先進入首頁' }}
          <span class="material-symbols-outlined text-[20px]" aria-hidden="true">arrow_forward</span>
        </button>
      </section>
    </section>
  </MobileAppShell>
</template>


