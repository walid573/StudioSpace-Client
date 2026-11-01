import { createAuthClient } from "better-auth/react";

/**
 * The auth server lives on the same origin (src/app/api/auth/[...all]/route.ts),
 * so the client can infer its base URL. `BETTER_AUTH_URL` is a server-only env
 * var and is not exposed to the browser.
 */
export const authClient = createAuthClient();

export const { signIn, signUp, useSession } = authClient;
