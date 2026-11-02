/* eslint-disable @next/next/no-img-element */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";


const API_URL = process.env.API_URL ?? "http://localhost:8000";


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
  const response = await fetch(`${API_URL}/studios`, { cache: "no-store" });
  if (!response.ok) return []; // if the request failed, return an empty list
  return response.json();
}


async function getBookings(email: string): Promise<Booking[]> {
  const response = await fetch(`${API_URL}/my-bookings/${encodeURIComponent(email)}`, {
    cache: "no-store",
  });
  if (!response.ok) return [];
  return response.json();
}




const STATUS_STYLES = {
  pending: { label: "Pending", color: "text-yellow-300 border-yellow-500/40" },
  confirmed: { label: "Confirmed", color: "text-emerald-300 border-emerald-500/40" },
  declined: { label: "Declined", color: "text-red-300 border-red-500/40" },
};


function StatCard({ title, value, href }: { title: string; value: number; href: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#121212] p-5">
      <p className="text-xs uppercase text-neutral-400">{title}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      <Link href={href} className="mt-3 inline-block text-xs text-neutral-400 hover:text-white">
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
    <div className="mx-auto max-w-5xl min-h-[65vh] px-4 py-10 text-white">
      
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Welcome back, {session.user.name ?? "there"}.
          </p>
        </div>
        <Link
          href="/add-studio"
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200"
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
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#121212] p-3"
                >
                  
                  <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-neutral-800">
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
                    <p className="truncate text-xs text-neutral-400">
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
        <div className="mt-6 rounded-2xl border border-white/10 bg-[#121212] px-6 py-16 text-center">
          <p className="font-semibold">Your dashboard is empty</p>
          <p className="mt-1 text-sm text-neutral-400">
            Add your first studio or browse available spaces.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/add-studio" className="rounded-full bg-white px-4 py-2 text-sm text-black">
              Add Studio
            </Link>
            <Link href="/studios" className="rounded-full border border-white/10 px-4 py-2 text-sm">
              Explore Studios
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}