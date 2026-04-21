<script setup lang="ts">
import { computed, ref } from 'vue'
import { Field } from 'vant'
import { useErrorToast } from '@/composables/useErrorToast'
import MobileAppShell from '@/components/MobileAppShell.vue'
import { useCoupleStore } from '@/pinia/couple'
import { useUserStore } from '@/pinia/user'
import { showSuccessMessage } from '@/services/uiFeedback'

const userStore = useUserStore()
const coupleStore = useCoupleStore()

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
    return '配對資料同步中'
  }

  return '尚未配對'
})
const formatInviteCodeInput = (value: string) => value.trim().toUpperCase()

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

</script>

<template>
  <MobileAppShell>
    <header class="space-y-[20px] px-[20px] pb-[24px] pt-[32px] sm:px-[28px] sm:pt-[40px]">
      <div class="flex items-start justify-between gap-[12px]">
        <div class="min-w-0">
          <div class="app-chip">伴侶配對</div>
          <h1 class="app-text-strong mt-[16px] max-w-[12ch] text-[34px] font-semibold leading-[1.04] tracking-[-0.045em]">
            輸入邀請碼完成配對
          </h1>
        </div>
      </div>

      <p class="app-text-muted max-w-[34ch] text-[14px] leading-[24px]">
        分享或輸入邀請碼，一起管理任務與獎勵。
      </p>
    </header>

    <section class="flex-1 space-y-[16px] px-[20px] pb-[24px] sm:px-[28px]">
      <section class="app-card px-[20px] py-[20px]">
        <p class="app-label">目前狀態</p>
        <p class="app-text-strong mt-[12px] text-[24px] font-semibold tracking-[-0.04em]">
          {{ getPairingStatus }}
        </p>
        <p class="app-text-muted mt-[12px] text-[14px] leading-[24px]">
          {{ userStore.profile?.coupleId ? '你已加入雙人空間。' : '還沒建立雙人空間。' }}
        </p>
        <p class="app-text-muted mt-[8px] text-[14px] leading-[24px]">
          {{ userStore.profile?.partnerUid ? '已找到配對對象，可開始共享任務。' : '輸入對方邀請碼後完成配對。' }}
        </p>
      </section>

      <section class="app-card-muted px-[20px] py-[20px]">
        <p class="app-label">我的邀請碼</p>
        <p class="app-text-strong mt-[12px] text-[30px] font-semibold tracking-[0.18em]">
          {{ userStore.profile?.inviteCode || '--------' }}
        </p>
        <p class="app-text-muted mt-[12px] text-[14px] leading-[24px]">
          把這組碼傳給另一半。
        </p>
      </section>

      <section class="app-card px-[20px] py-[20px]">
        <p class="app-label">輸入對方邀請碼</p>
        <label class="mt-[16px] block space-y-[8px]">
          <span class="app-field-label">邀請碼</span>
          <Field
            v-model="inviteCodeInput"
            class="app-vant-field"
            type="text"
            clearable
            :border="false"
            :formatter="formatInviteCodeInput"
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
