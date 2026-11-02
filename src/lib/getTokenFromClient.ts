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
      if (typeof token === "string" && token.trim()) return token.trim();
    } catch {
      // Fallback below avoids depending on a specific Better Auth proxy shape.
    }
  }

  if (typeof window === "undefined") return null;

  const urls = [
    `${window.location.origin}/api/auth/token`,
    `${window.location.origin}/api/auth/get-token`,
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) continue;

      const data = (await response.json()) as { token?: string | null } | null;
      const token = data?.token ?? null;
      if (typeof token === "string" && token.trim()) return token.trim();
    } catch {
      // Try the next Better Auth token endpoint if the route is unavailable.
    }
  }

  try {
    const sessionResponse = await fetch(`${window.location.origin}/api/auth/get-session`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    const jwtHeader = sessionResponse.headers.get("set-auth-jwt");
    if (jwtHeader && jwtHeader.trim()) return jwtHeader.trim();
  } catch {
    // Session token is not exposed via the header in this environment.
  }

  return null;
};