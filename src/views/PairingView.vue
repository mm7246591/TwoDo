<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useErrorToast } from '@/composables/useErrorToast'
import MobileAppShell from '@/components/MobileAppShell.vue'
import { useCoupleStore } from '@/pinia/couple'
import { useUserStore } from '@/pinia/user'
import { showSuccessMessage } from '@/services/uiFeedback'

const userStore = useUserStore()
const coupleStore = useCoupleStore()
const router = useRouter()

const inviteCodeInput = ref('')

useErrorToast(() => coupleStore.errorMessage)

const getCanJoinInvite = computed(() => {
  return Boolean(userStore.profile?.uid)
    && inviteCodeInput.value.trim().length >= 6
    && !coupleStore.isSubmitting
})

const getPairingStatus = computed(() => {
  if (coupleStore.getIsPaired) {
    return '已完成配對'
  }

  if (userStore.profile?.coupleId) {
    return '已經綁定在同一組 couple'
  }

  return '尚未配對'
})

const handleJoinInvite = async () => {
  if (!userStore.profile?.uid || !getCanJoinInvite.value) {
    return
  }

  try {
    await coupleStore.joinByInviteCode(userStore.profile.uid, inviteCodeInput.value)
    inviteCodeInput.value = ''
  } catch {
    return
  }

  showSuccessMessage('配對成功')
}

const backHome = async () => {
  await router.push({ name: 'home' })
}
</script>

<template>
  <MobileAppShell>
    <header class="space-y-[20px] px-[20px] pb-[24px] pt-[32px] sm:px-[28px] sm:pt-[40px]">
      <div class="flex items-start justify-between gap-[12px]">
        <div class="min-w-0">
          <div class="app-chip">伴侶配對</div>
          <h1 class="app-text-strong mt-[16px] max-w-[12ch] text-[34px] font-semibold leading-[1.04] tracking-[-0.045em]">
            用邀請碼把兩個帳號連在一起
          </h1>
        </div>

        <button class="app-ghost-button shrink-0 px-[16px] py-[12px] text-[14px]" type="button" @click="backHome">
          返回首頁
        </button>
      </div>

      <p class="app-text-muted max-w-[34ch] text-[14px] leading-[24px]">
        分享你的邀請碼給另一半，或輸入對方的邀請碼。配對完成後，你們就能共享任務、點數與獎勵。
      </p>
    </header>

    <section class="flex-1 space-y-[16px] px-[20px] pb-[24px] sm:px-[28px]">
      <section class="app-card px-[20px] py-[20px]">
        <p class="app-label">目前狀態</p>
        <p class="app-text-strong mt-[12px] text-[24px] font-semibold tracking-[-0.04em]">
          {{ getPairingStatus }}
        </p>
        <p class="app-text-muted mt-[12px] text-[14px] leading-[24px]">
          {{ userStore.profile?.coupleId ? '你已經加入一組雙人空間。' : '尚未建立雙人空間。' }}
        </p>
        <p class="app-text-muted mt-[8px] text-[14px] leading-[24px]">
          {{ userStore.profile?.partnerUid ? '已找到配對對象，可以開始建立共享任務。' : '輸入對方邀請碼後就會完成配對。' }}
        </p>
      </section>

      <section class="app-card-muted px-[20px] py-[20px]">
        <p class="app-label">我的邀請碼</p>
        <p class="app-text-strong mt-[12px] text-[30px] font-semibold tracking-[0.18em]">
          {{ userStore.profile?.inviteCode || '--------' }}
        </p>
        <p class="app-text-muted mt-[12px] text-[14px] leading-[24px]">
          把這組碼傳給另一半。只要對方輸入成功，你們就會自動綁定到同一個共享空間。
        </p>
      </section>

      <section class="app-card px-[20px] py-[20px]">
        <p class="app-label">輸入對方邀請碼</p>
        <label class="mt-[16px] block space-y-[8px]">
          <span class="app-field-label">邀請碼</span>
          <input
            v-model="inviteCodeInput"
            class="app-input"
            type="text"
            placeholder="例如 ABCD1234"
          />
        </label>

        <button
          class="app-secondary-button mt-[20px] w-full"
          type="button"
          :disabled="!getCanJoinInvite"
          @click="handleJoinInvite"
        >
          {{ coupleStore.isSubmitting ? '配對中...' : '用邀請碼配對' }}
        </button>
      </section>
    </section>
  </MobileAppShell>
</template>
