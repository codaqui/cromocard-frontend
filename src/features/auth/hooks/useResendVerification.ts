import { useResendVerification as useResendMutation } from '../auth.queries';

const SENT_MESSAGE = 'Se houver uma conta não confirmada com esse e-mail, enviamos um novo link.';

export function useResendVerificationFeedback() {
  const resend = useResendMutation();

  const errorFeedback = resend.error
    ? { tone: 'danger' as const, message: resend.error.message }
    : undefined;
  const feedback = resend.isSuccess
    ? { tone: 'success' as const, message: SENT_MESSAGE }
    : errorFeedback;

  return {
    isSubmitting: resend.isPending,
    feedback,
    submit: (input: { email: string }) => resend.mutate(input),
  };
}
