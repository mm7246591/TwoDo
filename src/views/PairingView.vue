<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import MobileAppShell from '@/components/MobileAppShell.vue'
import { useCoupleStore } from '@/pinia/couple'
import { useUserStore } from '@/pinia/user'

const userStore = useUserStore()
const coupleStore = useCoupleStore()
const router = useRouter()

const inviteCodeInput = ref('')

const canCreateInvite = computed(() => Boolean(userStore.profile?.uid) && !userStore.profile?.coupleId && !coupleStore.isSubmitting)
const canJoinInvite = computed(() => Boolean(userStore.profile?.uid) && inviteCodeInput.value.trim().length >= 6 && !coupleStore.isSubmitting)

const pairingStatus = computed(() => {
  if (coupleStore.isPaired) {
    return '已配對成功'
  }

  if (userStore.profile?.coupleId) {
    return '已建立邀請碼，等待另一半加入'
  }

  return '尚未建立配對'
})

const handleCreateInvite = async () => {
  if (!userStore.profile?.uid || !canCreateInvite.value) {
    return
  }

  try {
    await coupleStore.createInviteCode(userStore.profile.uid)
  } catch {
    // The store already exposes a user-facing error message.
  }
}

const handleJoinInvite = async () => {
  if (!userStore.profile?.uid || !canJoinInvite.value) {
    return
  }

  try {
    await coupleStore.joinByInviteCode(userStore.profile.uid, inviteCodeInput.value)
    inviteCodeInput.value = ''
  } catch {
    // The store already exposes a user-facing error message.
  }
}

const backHome = async () => {
  await router.push({ name: 'home' })
}
</script>

<template>
  <MobileAppShell>
    <header class="space-y-5 px-5 pb-6 pt-8 sm:px-7 sm:pt-10">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="app-chip">Pairing Flow</div>
          <h1 class="app-text-strong mt-4 max-w-[12ch] text-[2.15rem] font-semibold leading-[1.04] tracking-[-0.045em]">
            讓兩位使用者綁進同一個 couple
          </h1>
        </div>

        <button class="app-ghost-button shrink-0 px-4 py-3 text-sm" type="button" @click="backHome">
          返回首頁
        </button>
      </div>

      <p class="app-text-muted max-w-[34ch] text-sm leading-6">
        這一步會實際使用 `couples` collection，讓兩位使用者共享相同的 `coupleId`。
      </p>
    </header>

    <section class="flex-1 space-y-4 px-5 pb-6 sm:px-7">
      <section class="app-card px-5 py-5">
        <p class="app-label">目前狀態</p>
        <p class="app-text-strong mt-3 text-2xl font-semibold tracking-[-0.04em]">
          {{ pairingStatus }}
        </p>
        <p class="app-text-muted mt-3 text-sm leading-6">
          `users.coupleId`: {{ userStore.profile?.coupleId || '尚未建立' }}
        </p>
        <p class="app-text-muted mt-2 text-sm leading-6">
          `users.partnerUid`: {{ userStore.profile?.partnerUid || '尚未配對' }}
        </p>
      </section>

      <section class="app-card-muted px-5 py-5">
        <p class="app-label">目前邀請碼</p>
        <p class="app-text-strong mt-3 text-3xl font-semibold tracking-[0.18em]">
          {{ coupleStore.inviteCode || '--------' }}
        </p>
        <p class="app-text-muted mt-3 text-sm leading-6">
          在這個 MVP 版本裡，inviteCode 同時就是 couple 文件 ID，先用最簡單穩定的方式把流程接起來。
        </p>
      </section>

      <section class="app-card px-5 py-5">
        <p class="app-label">建立邀請碼</p>
        <p class="app-text-muted mt-3 text-sm leading-6">
          如果你還沒有 `coupleId`，可以先建立一組邀請碼分享給另一半。
        </p>

        <button
          class="app-primary-button mt-5 w-full"
          type="button"
          :disabled="!canCreateInvite"
          @click="handleCreateInvite"
        >
          {{ coupleStore.isSubmitting ? '建立中...' : '建立邀請碼' }}
        </button>
      </section>

      <section class="app-card px-5 py-5">
        <p class="app-label">加入邀請碼</p>
        <label class="mt-4 block space-y-2">
          <span class="app-field-label">邀請碼</span>
          <input
            v-model="inviteCodeInput"
            class="app-input"
            type="text"
            placeholder="例如 ABCD1234"
          />
        </label>

        <button
          class="app-secondary-button mt-5 w-full"
          type="button"
          :disabled="!canJoinInvite"
          @click="handleJoinInvite"
        >
          {{ coupleStore.isSubmitting ? '加入中...' : '用邀請碼加入' }}
        </button>
      </section>

      <p v-if="coupleStore.errorMessage" class="app-banner-danger app-text-danger px-4 py-3 text-sm">
        {{ coupleStore.errorMessage }}
      </p>
    </section>
  </MobileAppShell>
</template>
