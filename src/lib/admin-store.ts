export type Booking = {
  id: string;
  createdAt: string;
  vehicle: string;
  pickup: string;
  destination: string;
  date: string;
  days: string;
  trip: string;
  pax: string;
  ac: string;
  pickupLat?: string;
  pickupLng?: string;
  destinationLat?: string;
  destinationLng?: string;
  distanceKm?: string;
  distanceSource?: "route" | "straight";
  vehicleCategory?: string;
  vehicleSeats?: string;
  pricePerKm?: string;
  estimatedFare?: string;
  mapUrl?: string;
  status: "new" | "contacted" | "confirmed" | "cancelled";
};

// ---------------------------------------------------------------------------
// Local booking helpers (kept for offline fallback / optimistic UI)
// ---------------------------------------------------------------------------

const KEY = "agra_bookings_v1";

export function getBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveBooking(b: Omit<Booking, "id" | "createdAt" | "status">): Booking {
  const full: Booking = {
    ...b,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "new",
  };
  const all = [full, ...getBookings()];
  localStorage.setItem(KEY, JSON.stringify(all));
  return full;
}

export function updateBookingStatus(id: string, status: Booking["status"]) {
  const all = getBookings().map((b) => (b.id === id ? { ...b, status } : b));
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function deleteBooking(id: string) {
  const all = getBookings().filter((b) => b.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}

// ---------------------------------------------------------------------------
// API-backed admin authentication (Laravel Sanctum)
// ---------------------------------------------------------------------------

import { API_BASE } from "@/lib/api";

const TOKEN_KEY = "agra_admin_token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function isAdminAuthed(): boolean {
  return !!getAdminToken();
}

/**
 * Calls POST /api/admin/login and stores the Sanctum token on success.
 * Returns { ok: true } or { ok: false, message: string }.
 */
export async function adminLogin(
  email: string,
  password: string
): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, message: data?.message ?? "Invalid email or password." };
    }

    sessionStorage.setItem(TOKEN_KEY, data.token);
    return { ok: true };
  } catch {
    return { ok: false, message: "Unable to reach server. Please try again." };
  }
}

/**
 * Calls POST /api/admin/logout (best-effort) then clears the local token.
 */
export async function adminLogout(): Promise<void> {
  const token = getAdminToken();
  if (token) {
    try {
      await fetch(`${API_BASE}/admin/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    } catch {
      // ignore – we'll clear locally regardless
    }
  }
  sessionStorage.removeItem(TOKEN_KEY);
}
