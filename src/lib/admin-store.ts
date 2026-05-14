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

// Simple frontend-only admin gate. Replace with real auth via Lovable Cloud.
const ADMIN_PASSWORD = "agra2026";
const AUTH_KEY = "agra_admin_auth";

export function isAdminAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(AUTH_KEY) === "1";
}

export function adminLogin(email: string, password: string): boolean {
  if (password === ADMIN_PASSWORD && email.includes("@")) {
    sessionStorage.setItem(AUTH_KEY, "1");
    return true;
  }
  return false;
}

export function adminLogout() {
  sessionStorage.removeItem(AUTH_KEY);
}
