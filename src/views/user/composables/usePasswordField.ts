import { computed, ref } from "vue";
import type { Ref } from "vue";

export const PASSWORD_MIN_LENGTH = 8;

const usePasswordField = (hasSubmitted: Ref<boolean>) => {
  const password = ref("");
  const hasPasswordBlurred = ref(false);

  const trimmedPassword = computed(() => password.value.trim());
  const passwordErrorMessage = computed(() => {
    if (!trimmedPassword.value) return "請輸入密碼";
    if (trimmedPassword.value.length < PASSWORD_MIN_LENGTH)
      return `密碼至少需要 ${PASSWORD_MIN_LENGTH} 個字元`;
    return "";
  });
  const shouldShowPasswordError = computed(
    () =>
      Boolean(passwordErrorMessage.value) &&
      (hasSubmitted.value || hasPasswordBlurred.value),
  );

  const resetPassword = () => {
    password.value = "";
    hasPasswordBlurred.value = false;
  };

  return {
    password,
    trimmedPassword,
    passwordErrorMessage,
    hasPasswordBlurred,
    shouldShowPasswordError,
    resetPassword,
  };
};

export { usePasswordField };
