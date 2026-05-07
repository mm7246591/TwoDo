import { computed, ref } from "vue";
import type { Ref } from "vue";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const useEmailField = (hasSubmitted: Ref<boolean>) => {
  const email = ref("");
  const hasEmailBlurred = ref(false);

  const trimmedEmail = computed(() => email.value.trim());
  const emailErrorMessage = computed(() => {
    if (!trimmedEmail.value) return "請輸入電子信箱";
    if (!EMAIL_PATTERN.test(trimmedEmail.value)) return "請輸入有效的電子信箱格式";
    return "";
  });
  const shouldShowEmailError = computed(
    () =>
      Boolean(emailErrorMessage.value) &&
      (hasSubmitted.value || hasEmailBlurred.value),
  );

  const resetEmail = () => {
    email.value = "";
    hasEmailBlurred.value = false;
  };

  return {
    email,
    trimmedEmail,
    emailErrorMessage,
    hasEmailBlurred,
    shouldShowEmailError,
    resetEmail,
  };
};

export { useEmailField };
