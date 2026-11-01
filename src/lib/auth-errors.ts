export function getAuthErrorMessage(
  error: { message?: string } | null | undefined,
  fallback: string,
) {
  const message = error?.message?.trim();
  if (!message) return fallback;

  if (/provider not found|client id and client secret/i.test(message)) {
    return "Google sign-in is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to the environment and restart the dev server.";
  }

  return message;
}
