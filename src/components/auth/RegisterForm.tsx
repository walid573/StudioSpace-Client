"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Check, Circle, Eye, EyeOff, Loader2 } from "lucide-react";

import { GoogleIcon } from "@/components/auth/google-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { signUp, signIn } from "@/lib/auth-client";
import { toast } from "../ui/toast";

const inputClass =
  "h-11 rounded-xl border-input bg-background px-3 text-[14px] text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-ring focus-visible:ring-ring/10";

type FieldErrors = {
  name?: string;
  email?: string;
  photoUrl?: string;
};

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const pending = submitting || googleLoading;

  const passwordRules = [
    { label: "At least 6 characters", met: password.length >= 6 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
  ];
  const passwordValid = passwordRules.every((rule) => rule.met);
  const highlightUnmetRules = password.length > 0 || attemptedSubmit;

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      return { ...current, [field]: undefined };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setError(null);

  if (!name.trim()) {
    setError("Enter your full name.");
    return;
  }

  if (!passwordValid) {
    setError("Choose a password that meets all the requirements.");
    
    return;
  }

  setSubmitting(true);

  try {
    const { error } = await signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
      image: photoUrl.trim() || undefined,
    });

    if (error) {
      
      setError(
        getAuthErrorMessage(error, "We couldn't create your account. Please try again."),
      );
      return;
    }

    setName("");
    setEmail("");
    setPhotoUrl("");
    setPassword("");
     toast.add({
      title: "Account created",
      description: "Please log in to continue.",
      type: "success",
    });
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

    try {
      const { error: socialError } = await signIn.social({
        provider: "google",
        callbackURL: "/",
      });
      
      if (socialError) {
        toast.add({
          title: "Google sign-up failed",
          description: getAuthErrorMessage(socialError, "Please try again."),
          type: "error",
        });
        setError(
          getAuthErrorMessage(socialError, "Google sign-up failed. Please try again."),
        );
      }
    } catch {
      toast.add({
        title: "Google sign-up failed",
        description: "Please try again.",
        type: "error",
      });
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
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            value={name}
            aria-invalid={Boolean(fieldErrors.name)}
            onChange={(event) => {
              setName(event.target.value);
              clearFieldError("name");
            }}
            className={inputClass}
          />
          {fieldErrors.name && (
            <p className="text-[11px] text-red-400">{fieldErrors.name}</p>
          )}
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
            value={email}
            aria-invalid={Boolean(fieldErrors.email)}
            onChange={(event) => {
              setEmail(event.target.value);
              clearFieldError("email");
            }}
            className={inputClass}
          />
          {fieldErrors.email && (
            <p className="text-[11px] text-red-400">{fieldErrors.email}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="register-photo" className="text-[12px] font-medium text-foreground">
            Photo URL
          </Label>
          <Input
            id="register-photo"
            name="photoUrl"
            type="url"
            inputMode="url"
            placeholder="https://i.ibb.co/your-photo.jpg"
            value={photoUrl}
            aria-invalid={Boolean(fieldErrors.photoUrl)}
            onChange={(event) => {
              setPhotoUrl(event.target.value);
              clearFieldError("photoUrl");
            }}
            className={inputClass}
          />
          {fieldErrors.photoUrl ? (
            <p className="text-[11px] text-red-400">{fieldErrors.photoUrl}</p>
          ) : (
            <p className="text-[11px] leading-4 text-muted-foreground">
              A link to your profile picture
            </p>
          )}
        </div>

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
              value={password}
              aria-invalid={password.length > 0 && !passwordValid}
              aria-describedby="register-password-rules"
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

          <ul id="register-password-rules" className="space-y-1.5 pt-1">
            {passwordRules.map((rule) => (
              <li
                key={rule.label}
                className={`flex items-center gap-1.5 text-[11px] leading-4 ${
                  rule.met
                    ? "text-neutral-300"
                    : highlightUnmetRules
                      ? "text-red-400"
                      : "text-neutral-500"
                }`}
              >
                {rule.met ? (
                  <Check className="size-3 shrink-0 text-emerald-400" />
                ) : (
                  <Circle className="size-3 shrink-0" />
                )}
                {rule.label}
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
          {submitting ? "Creating account…" : "Register"}
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
        {googleLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <GoogleIcon className="size-4" />
        )}
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
