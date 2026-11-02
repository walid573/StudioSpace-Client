import { jwtClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

const clientBaseUrl =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

export const authClient = createAuthClient({
  baseURL: clientBaseUrl,
  plugins: [jwtClient()],
});

export const { signIn, signUp, useSession } = authClient;
