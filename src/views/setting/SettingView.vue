<script setup lang="ts">
import MobileAppShell from "@/components/common/MobileAppShell.vue";
import SettingEmptyProfileState from "@/components/setting/SettingEmptyProfileState.vue";
import SettingMenuGroups from "@/components/setting/SettingMenuGroups.vue";
import SettingProfileCard from "@/components/setting/SettingProfileCard.vue";
import SettingSignOutButton from "@/components/setting/SettingSignOutButton.vue";
import SettingTopBar from "@/components/setting/SettingTopBar.vue";
import { useSettingView } from "./composables/useSettingView";

const {
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
} = useSettingView();
</script>

<template>
  <MobileAppShell>
    <SettingTopBar @back="goBack" />

    <main class="mx-auto grid w-full max-w-[672px] flex-1 gap-[24px] px-[20px] pb-[48px] pt-[8px] sm:px-[28px]">
      <SettingEmptyProfileState v-if="!hasProfile" />

      <template v-else>
        <SettingProfileCard v-model:display-name-input="displayNameInput" :can-save-display-name="canSaveDisplayName"
          :connection-days="connectionDays" :connection-label="connectionLabel" :display-name="displayName"
          :is-editor-open="isProfileEditorOpen" :is-saving-profile="isSavingProfile"
          :is-uploading-avatar="isUploadingAvatar" :partner-status-text="partnerStatusText" :photo-url="photoUrl"
          :points="points" @save-display-name="handleSaveDisplayName" @upload-avatar="handleAvatarUpload" />

        <SettingMenuGroups :is-couple-submitting="isCoupleSubmitting" :is-dark-mode-enabled="isDarkModeEnabled"
          :partner-button-text="partnerButtonText" :unread-notifications-text="unreadNotificationsText"
          @open-profile-editor="toggleProfileEditor" @open-partner-settings="handlePartnerSettings"
          @open-notifications="goToNotifications" @open-points-guide="showPointsGuide"
          @update-dark-mode="handleThemeToggle" />

        <SettingSignOutButton :is-submitting="isSigningOut" @sign-out="handleSignOut" />
      </template>
    </main>
  </MobileAppShell>
</template>
