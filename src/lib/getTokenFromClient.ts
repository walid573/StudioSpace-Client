import { authClient } from "./auth-client";

const clientWithJwt = authClient as typeof authClient & {
  getToken?: () => Promise<{ data?: { token?: string | null } | null; token?: string | null } | null>;
  token?: () => Promise<{ data?: { token?: string | null } | null; token?: string | null } | null>;
};

export const getTokenFromClient = async (): Promise<string | null> => {
  const attempts = [
    async () => clientWithJwt.token?.(),
    async () => clientWithJwt.getToken?.(),
  ];

  for (const run of attempts) {
    try {
      const result = await run();
      if (!result) continue;

      const payload = result as any;
      const token = payload?.data?.token ?? payload?.token ?? null;
      if (typeof token === "string" && token.trim()) return token;
    } catch {
      // Fallback below avoids depending on a specific Better Auth proxy shape.
    }
  }

  if (typeof window === "undefined") return null;

  try {
    const response = await fetch(`${window.location.origin}/api/auth/token`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return null;
    const data = (await response.json()) as { token?: string | null } | null;
    const token = data?.token ?? null;
    if (typeof token === "string" && token.trim()) return token;
  } catch {
    // No usable token for the current session.
  }

  return null;
};