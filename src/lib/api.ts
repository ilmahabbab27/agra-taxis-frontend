import type { Booking } from "@/lib/admin-store";

const DEFAULT_API_BASE = "http://localhost/Agra%20Taxis%20Backend/public/api";

export const API_BASE = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE).replace(/\/$/, "");

export async function createBooking(booking: Omit<Booking, "id" | "createdAt" | "status">) {
  const response = await fetch(`${API_BASE}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(booking),
  });

  if (!response.ok) {
    throw new Error("Booking API request failed");
  }

  return response.json();
}
