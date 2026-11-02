import type { Metadata } from "next";

import LoginForm from "@/components/auth/LoginForm";

export const instant = false;

export const metadata: Metadata = {
  title: "Login | StudioSpace",
};

function safeRedirect(value: string | string[] | undefined) {
  if (typeof value !== "string") return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    redirect?: string | string[];
    registered?: string | string[];
  }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-background px-4 py-12 text-foreground sm:px-6 sm:py-16">
      <LoginForm
        redirectTo={safeRedirect(params.redirect)}
        registered={params.registered === "1"}
      />
    </div>
  );
}
