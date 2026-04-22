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
    <header class="app-page-header">
      <div class="app-page-header-row">
        <div class="min-w-0">
          <div class="app-chip">配對</div>
          <h1 class="app-page-title mt-3 max-w-[11ch]">
            連接你們的小空間
          </h1>
        </div>
      </div>

      <p class="app-page-summary">
        分享邀請碼，把待辦和獎勵放在一起。
      </p>
    </header>

    <section class="app-page-content app-section-stack flex-1">
      <section class="app-card app-card-section">
        <p class="app-label">目前狀態</p>
        <p class="app-status-title mt-3">
          {{ getPairingStatus }}
        </p>
        <p class="app-card-caption mt-3">
          {{ userStore.profile?.coupleId ? '已加入兩人的小空間。' : '尚未加入兩人的小空間。' }}
        </p>
        <p class="app-card-caption mt-2">
          {{ userStore.profile?.partnerUid ? '已找到另一半，可以開始一起分擔。' : '輸入另一半的邀請碼後即可完成配對。' }}
        </p>
      </section>

      <section class="app-card-muted app-card-section">
        <p class="app-label">我的邀請碼</p>
        <p class="app-code-display mt-3">
          {{ userStore.profile?.inviteCode || '--------' }}
        </p>
        <p class="app-card-caption mt-3">
          將這組碼傳給另一半。
        </p>
      </section>

      <section class="app-card app-card-section">
        <p class="app-label">輸入另一半邀請碼</p>
        <label class="app-field-stack mt-4 block">
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
          class="app-secondary-button mt-5 w-full"
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
