/* eslint-disable @next/next/no-img-element */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getTokenFromServer } from "@/lib/getTokenFromSever";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";



type Studio = {
  _id: string;
  title?: string;
  imageUrl?: string;
  ownerEmail?: string;
  hostEmail?: string;
};

type Booking = {
  _id: string;
  studioId: string;
  date: string;
  start: string;
  end: string;
  hours: number;
  total: number;
  status: "pending" | "confirmed" | "declined";
};


async function getStudios(): Promise<Studio[]> {
  const response = await fetch(`${API_URL}/studios`, {
    next: { revalidate: 60 },
  });
  if (!response.ok) return []; 
  return response.json();
}


async function getBookings(email: string): Promise<Booking[]> {
  const token = await getTokenFromServer();
  const fetchOptions: RequestInit = {
     cache: "no-store",
    credentials: "include",
  };

  if (token) {
    fetchOptions.headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  try {
    const response = await fetch(`${API_URL}/my-bookings/${encodeURIComponent(email)}`, fetchOptions);
    if (!response.ok) return [];

    const payload = await response.json();
    const bookings = Array.isArray(payload) ? payload : Array.isArray(payload?.bookings) ? payload.bookings : [];
    return bookings.filter((booking:Booking) => booking && typeof booking === "object");
  } catch {
    return [];
  }
}




const STATUS_STYLES = {
  pending: { label: "Pending", color: "text-yellow-300 border-yellow-500/40" },
  confirmed: { label: "Confirmed", color: "text-emerald-300 border-emerald-500/40" },
  declined: { label: "Declined", color: "text-red-300 border-red-500/40" },
};


function StatCard({ title, value, href }: { title: string; value: number; href: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs uppercase text-muted-foreground">{title}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      <Link href={href} className="mt-3 inline-block text-xs text-muted-foreground hover:text-foreground">
        View →
      </Link>
    </div>
  );
}



export default async function DashboardPage() {
  
  const session = await auth.api.getSession({ headers: await headers() });

  
  if (!session) redirect("/login");

  const email = session.user.email;

 
  const [studios, bookings] = await Promise.all([getStudios(), getBookings(email)]);

  
  const myListings = studios.filter(
    (studio) => (studio.ownerEmail ?? studio.hostEmail)?.toLowerCase() === email.toLowerCase()
  );

  
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;

  
  const recentBookings = bookings.slice(0, 5);

  
  return (
    <div className="mx-auto max-w-5xl min-h-[65vh] px-4 py-10 text-foreground">
      
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {session.user.name ?? "there"}.
          </p>
        </div>
        <Link
          href="/add-studio"
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Add New Studio
        </Link>
      </header>

      
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="My Listings" value={myListings.length} href="/my-listings" />
        <StatCard title="Pending" value={pendingCount} href="/my-bookings?filter=pending" />
        <StatCard title="Confirmed" value={confirmedCount} href="/my-bookings?filter=confirmed" />
        <StatCard title="Total Bookings" value={bookings.length} href="/my-bookings" />
      </div>

      
      {recentBookings.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Recent Bookings</h2>

          <ul className="mt-4 space-y-3">
            {recentBookings.map((booking) => {
              
              const studio = studios.find((s) => s._id === booking.studioId);
              const status = STATUS_STYLES[booking.status];

              return (
                <li
                  key={booking._id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
                >
                  
                  <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {studio?.imageUrl && (
                      <img
                        src={studio.imageUrl}
                        alt={studio.title ?? "Studio"}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                 
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{studio?.title ?? "Studio booking"}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {booking.date} · {booking.start} to {booking.end} · {booking.hours} hrs · $
                      {booking.total}
                    </p>
                  </div>

                  
                  <span className={`rounded-full border px-3 py-1 text-xs ${status.color}`}>
                    {status.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      
      {myListings.length === 0 && bookings.length === 0 && (
        <div className="mt-6 rounded-2xl border border-border bg-card px-6 py-16 text-center">
          <p className="font-semibold">Your dashboard is empty</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first studio or browse available spaces.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/add-studio" className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">
              Add Studio
            </Link>
            <Link href="/studios" className="rounded-full border border-border px-4 py-2 text-sm">
              Explore Studios
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}