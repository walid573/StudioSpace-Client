/* eslint-disable @next/next/no-img-element -- avatar URLs come from the auth provider, so next/image cannot optimise them. */

import { headers } from "next/headers";

import { format } from "date-fns";

import { auth } from "@/lib/auth";
import EditProfileDialog from "@/components/profile/EditProfileDialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const instant = false;

export const metadata = {
  title: "Profile | StudioSpace",
  description: "Your StudioSpace profile, listings and booking activity.",
};

type Studio = {
  title?: string;
  ownerEmail?: string;
  hostEmail?: string;
  reviewCount?: number;
};

const BUTTON =
  "inline-flex h-9 items-center rounded-full bg-primary px-4 text-[12px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const BADGE =
  "rounded-full border border-border bg-muted/70 px-2.5 py-1 text-[11px] font-medium text-foreground";

async function getArray<T>(url: string): Promise<T[]> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
    });
    const data = res.ok ? await res.json() : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function ProfilePage() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });


  const { user } = session!;
  const email = user.email;

  const [studios, bookings, accounts] = await Promise.all([
    getArray<Studio>(`${API_URL}/studios`),
    getArray<unknown>(`${API_URL}/my-bookings/${encodeURIComponent(email)}`),
    auth.api.listUserAccounts({ headers: requestHeaders }).catch(() => []),
  ]);

  const listings = studios.filter(
    (s) =>
      s.title && (s.ownerEmail ?? s.hostEmail)?.toLowerCase() === email.toLowerCase()
  );
  const reviewCount = listings.reduce((sum, s) => sum + (Number(s.reviewCount) || 0), 0);

  const role = listings.length
    ? bookings.length
      ? "Host and creator"
      : "Host"
    : "Creator";

  const provider = accounts.find((a) => a.providerId !== "credential")?.providerId;
  const signIn = provider ? provider[0].toUpperCase() + provider.slice(1) : "Email";

  const createdAt = new Date(user.createdAt);
  const memberSince = isNaN(createdAt.getTime()) ? "—" : format(createdAt, "MMM yyyy");

  const stats = [
    { value: String(listings.length), label: "Listings" },
    { value: String(bookings.length), label: "Bookings" },
    { value: String(reviewCount), label: "Reviews" },
    { value: memberSince, label: "Member since" },
  ];

  const accountRows = [
    { label: "Name", value: user.name },
    { label: "Email", value: email },
    { label: "Role", value: role },
    { label: "Sign-in", value: signIn },
  ];

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background text-foreground">
      <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 lg:py-16">
        <section className="flex flex-col items-center text-center">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-2 rounded-full bg-blue-500/20 blur-2xl"
            />
            <div className="relative rounded-full bg-[linear-gradient(155deg,#93c5fd,#2563eb_55%,#1e3a8a)] p-[2px]">
              <div className="rounded-full bg-background p-1">
                <div className="flex size-24 items-center justify-center overflow-hidden rounded-full bg-muted text-[34px] font-semibold text-foreground sm:size-28 sm:text-[40px]">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="size-full object-cover"
                    />
                  ) : (
                    (user.name?.trim().charAt(0) || "U").toUpperCase()
                  )}
                </div>
              </div>
            </div>
          </div>

          <h1 className="mt-5 text-[24px] font-bold tracking-[-0.02em] sm:text-[28px]">
            {user.name}
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground sm:text-[14px]">{email}</p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className={BADGE}>{role}</span>
            {user.emailVerified && <span className={BADGE}>Verified</span>}
          </div>

          <div className="mt-5">
            <EditProfileDialog
              name={user.name}
              image={user.image}
              triggerClassName={BUTTON}
            />
          </div>
        </section>

        <dl className="mt-10 grid grid-cols-2 gap-y-5 border-y border-border py-5 sm:grid-cols-4 sm:gap-y-0 sm:divide-x sm:divide-border">
          {stats.map(({ value, label }) => (
            <div key={label} className="sm:px-5 sm:first:pl-0 sm:last:pr-0">
              <dt className="text-[22px] leading-none font-bold tracking-[-0.02em] sm:text-[24px]">
                {value}
              </dt>
              <dd className="mt-1.5 text-[11.5px] text-muted-foreground">{label}</dd>
            </div>
          ))}
        </dl>

        <section className="mt-10">
          <h2 className="text-[17px] font-bold tracking-[-0.01em]">Account details</h2>
          <dl className="mt-3 divide-y divide-border border-y border-border">
            {accountRows.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between gap-6 py-3.5">
                <dt className="text-[13px] text-muted-foreground">{label}</dt>
                <dd className="max-w-[70%] truncate text-right text-[13px] font-medium">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}