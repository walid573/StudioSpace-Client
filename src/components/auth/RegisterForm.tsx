"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Check, Circle, Eye, EyeOff, Loader2 } from "lucide-react";

import { GoogleIcon } from "@/components/auth/google-icon";
import ImageUploadField from "@/components/images/ImageUploadField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { signUp, signIn } from "@/lib/auth-client";
import { toast } from "../ui/toast";

const inputClass =
  "h-11 rounded-xl border-input bg-background px-3 text-[14px] text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-ring focus-visible:ring-ring/10";

const PASSWORD_RULES = [
  { label: "At least 6 characters", test: (p: string) => p.length >= 6 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
];

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [photoUrl, setPhotoUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const pending = submitting || googleLoading || uploadingPhoto;
  const rules = PASSWORD_RULES.map((r) => ({ label: r.label, met: r.test(form.password) }));
  const passwordValid = rules.every((r) => r.met);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;

    if (!form.name.trim()) return setError("Enter your full name.");
    if (!form.email.trim()) return setError("Enter your email.");
    if (!passwordValid) return setError("Choose a password that meets all the requirements.");

    setError(null);
    setSubmitting(true);

    try {
      const { error: authError } = await signUp.email({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        image: photoUrl || undefined,
      });

      if (authError) {
        return setError(getAuthErrorMessage(authError, "We couldn't create your account. Please try again."));
      }

      toast.add({ title: "Account created", description: "Welcome aboard.", type: "success" });
      router.replace("/");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignUp() {
    setError(null);
    setGoogleLoading(true);

    const fail = (message: string) => {
      setError(message);
      toast.add({ title: "Google sign-up failed", description: message, type: "error" });
    };

    try {
      const { error: socialError } = await signIn.social({ provider: "google", callbackURL: "/" });
      if (socialError) fail(getAuthErrorMessage(socialError, "Google sign-up failed. Please try again."));
    } catch {
      fail("Google sign-up failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[420px] rounded-2xl border border-border bg-card p-6 shadow-[0_18px_45px_rgba(0,0,0,0.08)] sm:p-7">
      <h1 className="text-[28px] leading-tight font-bold tracking-[-0.03em] text-foreground">
        Create your account
      </h1>
      <p className="mt-2 text-[13px] leading-5 text-muted-foreground">
        Book creative spaces or host your own in minutes.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="register-name" className="text-[12px] font-medium text-foreground">
            Name
          </Label>
          <Input
            id="register-name"
            name="name"
            autoComplete="name"
            placeholder="Your full name"
            value={form.name}
            onChange={set("name")}
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="register-email" className="text-[12px] font-medium text-foreground">
            Email
          </Label>
          <Input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set("email")}
            className={inputClass}
          />
        </div>

        <ImageUploadField
          value={photoUrl}
          onChange={setPhotoUrl}
          onUploadingChange={setUploadingPhoto}
          fallback={form.name}
          label="Profile photo"
        />

        <div className="space-y-1.5">
          <Label htmlFor="register-password" className="text-[12px] font-medium text-foreground">
            Password
          </Label>
          <div className="relative">
            <Input
              id="register-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a password"
              value={form.password}
              aria-invalid={form.password.length > 0 && !passwordValid}
              aria-describedby="register-password-rules"
              onChange={set("password")}
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          <ul id="register-password-rules" className="space-y-1.5 pt-1">
            {rules.map(({ label, met }) => (
              <li
                key={label}
                className={`flex items-center gap-1.5 text-[11px] leading-4 ${met ? "text-neutral-300" : form.password ? "text-red-400" : "text-neutral-500"
                  }`}
              >
                {met ? <Check className="size-3 shrink-0 text-emerald-400" /> : <Circle className="size-3 shrink-0" />}
                {label}
              </li>
            ))}
          </ul>
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
          {submitting ? "Creating account…" : uploadingPhoto ? "Uploading photo…" : "Register"}
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
        onClick={handleGoogleSignUp}
        className="h-11 w-full gap-2 rounded-full border-border bg-transparent text-[13px] font-medium text-foreground hover:bg-accent hover:text-foreground disabled:opacity-60"
      >
        {googleLoading ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon className="size-4" />}
        Continue with Google
      </Button>

      <p className="mt-6 text-center text-[13px] text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-foreground underline-offset-4 transition-colors hover:underline"
        >
          Login
        </Link>
      </p>
    </div>
  );
}