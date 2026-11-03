"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { GoogleIcon } from "@/components/auth/google-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { signIn } from "@/lib/auth-client";
import { toast } from "../ui/toast";

const inputClass =
  "h-11 rounded-xl border-input bg-background px-3 text-[14px] text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-ring focus-visible:ring-ring/10";

export default function LoginForm({
  redirectTo,
  registered,
}: {
  redirectTo: string;
  registered: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const pending = submitting || googleLoading;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setError(null);
  setSubmitting(true);

  try {
    const { error } = await signIn.email({
      email: email.trim(),
      password,
      rememberMe: true,
    });

    if (error) {
      setError(
        getAuthErrorMessage(
          error,
          "We couldn't log you in. Check your email and password and try again.",
        ),
      );
      
      setSubmitting(false);
      return;
    }
    toast.add({ title: `Welcome back!`, type: "success" });
    router.replace(redirectTo);
    router.refresh();
  } catch {
    toast.add({
      title: "Something went wrong",
      description: "Please try again.",
      type: "error",
    });
    setError("Something went wrong while logging in. Please try again.");
    setSubmitting(false);
  }
}

 async function handleGoogleSignIn() {
  setError(null);
  setGoogleLoading(true);

  try {
    const { error } = await signIn.social({
      provider: "google",
      callbackURL: redirectTo,
    });

    if (error) {
      setError(getAuthErrorMessage(error, "Google sign-in failed. Please try again."));
    }
  } catch {
    setError("Google sign-in failed. Please try again.");
  } finally {
    setGoogleLoading(false);
  }
}

  return (
    <div className="w-full max-w-[400px] rounded-2xl border border-border bg-card p-6 shadow-[0_18px_45px_rgba(0,0,0,0.08)] sm:p-7">
      <h1 className="text-[28px] leading-tight font-bold tracking-[-0.03em] text-foreground">
        Welcome back
      </h1>
      <p className="mt-2 text-[13px] leading-5 text-muted-foreground">
        Log in to manage your bookings and listings.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        {registered && !error && (
          <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-[12px] leading-5 text-emerald-300">
            Account created. Log in with your new password to continue.
          </p>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="login-email" className="text-[12px] font-medium text-foreground">
            Email
          </Label>
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="login-password" className="text-[12px] font-medium text-foreground">
              Password
            </Label>
            <button
              type="button"
              onClick={() =>
                setNotice("Password reset isn't available yet. Please contact support.")
              }
              className="text-[11px] text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
            >
              Forgot password?
            </button>
          </div>

          <div className="relative">
            <Input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          {notice && <p className="text-[11px] leading-4 text-muted-foreground">{notice}</p>}
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-[12px] leading-5 text-red-300"
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={pending}
          className="h-11 w-full gap-2 rounded-full bg-primary text-[13px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {submitting ? "Logging in…" : "Login"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[11px] text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={handleGoogleSignIn}
        className="h-11 w-full gap-2 rounded-full border-border bg-transparent text-[13px] font-medium text-foreground hover:bg-accent hover:text-foreground disabled:opacity-60"
      >
        {googleLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <GoogleIcon className="size-4" />
        )}
        Continue with Google
      </Button>

      <p className="mt-6 text-center text-[13px] text-muted-foreground">
        New to StudioSpace?{" "}
        <Link
          href="/register"
          className="font-semibold text-foreground underline-offset-4 transition-colors hover:underline"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
