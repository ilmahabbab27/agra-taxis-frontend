import { API_BASE } from "@/lib/api";
import { getAdminToken } from "@/lib/admin-store";

const DRIVER_TOKEN_KEY = "agra_driver_token";

export function getDriverToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(DRIVER_TOKEN_KEY);
}

export function clearDriverToken() {
  sessionStorage.removeItem(DRIVER_TOKEN_KEY);
}

export type DriverRegistration = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  username?: string;
  province: string;
  district: string;
  vehicleCategory: string;
  vehicleName: string;
  vehicleRegistrationNumber: string;
  vehicleColour: string;
  location: string;
  seatCapacity: number;
  airConditioning: "ac" | "non_ac";
  vehiclePhotos: string[];
  driverDocument: string;
  insuranceDocument: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export type DriverRide = {
  id: string; driverId: string | null; rideDate: string; customerName: string; customerPhone: string; pickup: string;
  destination: string; tripType: string; distanceKm: number; rideAmount: number; driverPayment: number;
  otherCharges: number; totalAmount: number; paymentStatus: "paid" | "unpaid" | "partial";
  paymentMethod: string; notes: string; paymentProof: string;
};

export type DriverRideInput = Omit<DriverRide, "id" | "totalAmount" | "paymentProof"> & { paymentProofFile?: File };

function normalizeRide(row: Record<string, unknown>): DriverRide {
  return { id: String(row.id), driverId: row.driver_id == null && row.driverId == null ? null : String(row.driver_id ?? row.driverId), rideDate: String(row.ride_date ?? row.rideDate), customerName: String(row.customer_name ?? row.customerName), customerPhone: String(row.customer_phone ?? row.customerPhone ?? ""), pickup: String(row.pickup), destination: String(row.destination), tripType: String(row.trip_type ?? row.tripType), distanceKm: Number(row.distance_km ?? row.distanceKm ?? 0), rideAmount: Number(row.ride_amount ?? row.rideAmount ?? 0), driverPayment: Number(row.driver_payment ?? row.driverPayment ?? 0), otherCharges: Number(row.other_charges ?? row.otherCharges ?? 0), totalAmount: Number(row.total_amount ?? row.totalAmount ?? 0), paymentStatus: row.payment_status as DriverRide["paymentStatus"], paymentMethod: String(row.payment_method ?? row.paymentMethod ?? ""), notes: String(row.notes ?? ""), paymentProof: String(row.payment_proof ?? row.paymentProof ?? "") };
}

export type DriverRegistrationInput = Omit<DriverRegistration, "id" | "status" | "createdAt" | "username"> & {
  password: string;
  vehiclePhotoFiles?: File[];
  driverDocumentFile?: File;
  insuranceDocumentFile?: File;
};

function normalizeDriver(row: Record<string, unknown>): DriverRegistration {
  return {
    id: String(row.id),
    fullName: String(row.full_name ?? row.fullName),
    email: String(row.email),
    phone: String(row.phone),
    username: String(row.username),
    province: String(row.province),
    district: String(row.district),
    location: String(row.location),
    vehicleCategory: String(row.vehicle_category ?? row.vehicleCategory),
    vehicleName: String(row.vehicle_name ?? row.vehicleName),
    vehicleRegistrationNumber: String(
      row.vehicle_registration_number ?? row.vehicleRegistrationNumber,
    ),
    vehicleColour: String(row.vehicle_colour ?? row.vehicleColour),
    seatCapacity: Number(row.seat_capacity ?? row.seatCapacity),
    airConditioning: (row.air_conditioning ?? row.airConditioning) as "ac" | "non_ac",
    vehiclePhotos: (row.vehicle_photos ?? row.vehiclePhotos ?? []) as string[],
    driverDocument: String(row.driver_document ?? row.driverDocument),
    insuranceDocument: String(row.insurance_document ?? row.insuranceDocument),
    status: row.status as DriverRegistration["status"],
    createdAt: String(row.created_at ?? row.createdAt),
  };
}

function generatedUsername(email: string) {
  return email.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80) || "driver";
}

async function request(path: string, options?: RequestInit, authToken = getAdminToken()) {
  const token = authToken;
  const url = `${API_BASE}${path}`;
  console.info("Driver portal API request", {
    method: options?.method || "GET",
    url,
    hasToken: Boolean(token),
  });
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);
  const startedAt = performance.now();
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...options?.headers,
      },
    });
    console.info("Driver portal API response", {
      method: options?.method || "GET",
      url,
      status: response.status,
      durationMs: Math.round(performance.now() - startedAt),
    });
  } catch (error) {
    console.error("Driver portal network/CORS/timeout error", {
      method: options?.method || "GET",
      url,
      durationMs: Math.round(performance.now() - startedAt),
      error,
    });
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const validationDetails = body?.errors
      ? Object.entries(body.errors)
          .map(([field, messages]) => `${field}: ${(messages as string[]).join(", ")}`)
          .join(" | ")
      : "";
    const message = validationDetails || body?.message || "Driver portal request failed";
    console.error("Driver portal API error", {
      method: options?.method || "GET",
      url,
      status: response.status,
      message,
    });
    throw new Error(`${response.status}: ${message}`);
  }
  return response.json();
}

export async function registerDriver(input: DriverRegistrationInput) {
  const {
    vehiclePhotos: _vehiclePhotos,
    driverDocument: _driverDocument,
    insuranceDocument: _insuranceDocument,
    vehiclePhotoFiles,
    driverDocumentFile,
    insuranceDocumentFile,
    ...fields
  } = input;
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((entry) => form.append(`${key}[]`, entry));
    else form.append(key, String(value));
  });
  // Keep compatibility with older deployed APIs while the user only enters an email.
  form.append("username", generatedUsername(input.email));
  vehiclePhotoFiles?.forEach((file) => form.append("vehiclePhotos[]", file));
  if (driverDocumentFile) form.append("driverDocument", driverDocumentFile);
  if (insuranceDocumentFile) form.append("insuranceDocument", insuranceDocumentFile);
  return request("/driver-registrations", { method: "POST", body: form });
}

export async function loginDriver(email: string, password: string) {
  const result = await request("/driver-auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      username: generatedUsername(email),
    }),
  });
  if (result.token) sessionStorage.setItem(DRIVER_TOKEN_KEY, result.token);
  return result;
}

export async function getDriverAccount(): Promise<DriverRegistration> {
  const result = await request("/driver-account", undefined, getDriverToken());
  return normalizeDriver(result.driver || result);
}

export async function updateDriverAccount(
  driver: DriverRegistration,
  password: string,
  files?: { vehiclePhotoFiles?: File[]; driverDocumentFile?: File; insuranceDocumentFile?: File },
) {
  const form = new FormData();
  const fields = {
    fullName: driver.fullName, email: driver.email, phone: driver.phone, province: driver.province,
    district: driver.district, location: driver.location, vehicleCategory: driver.vehicleCategory,
    vehicleName: driver.vehicleName, vehicleRegistrationNumber: driver.vehicleRegistrationNumber,
    vehicleColour: driver.vehicleColour, seatCapacity: driver.seatCapacity,
    airConditioning: driver.airConditioning,
  };
  Object.entries(fields).forEach(([key, value]) => form.append(key, String(value)));
  if (password.trim()) form.append("password", password.trim());
  files?.vehiclePhotoFiles?.forEach((file) => form.append("vehiclePhotos[]", file));
  if (files?.driverDocumentFile) form.append("driverDocument", files.driverDocumentFile);
  if (files?.insuranceDocumentFile) form.append("insuranceDocument", files.insuranceDocumentFile);
  form.append("_method", "PATCH");
  const result = await request("/driver-account", { method: "POST", body: form }, getDriverToken());
  return normalizeDriver(result.driver || result);
}

export async function sendDriverPasswordReset(email: string) {
  return request("/driver-auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function changeDriverPassword(token: string, password: string) {
  return request("/driver-auth/change-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}

export async function getDriverRegistrations(): Promise<DriverRegistration[]> {
  try {
    const payload = await request("/admin/driver-registrations");
    const rows = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.drivers)
          ? payload.drivers
          : [];
    console.info("Driver portal applications loaded", {
      count: rows.length,
      responseKeys: payload && typeof payload === "object" ? Object.keys(payload) : [],
    });
    return rows.map((row: Record<string, unknown>) => normalizeDriver(row));
  } catch (error) {
    console.error("Failed to load driver applications", error);
    throw error;
  }
}

export async function getDriverRides(driverId: string): Promise<DriverRide[]> {
  const rows = await request(`/admin/drivers/${driverId}/rides`);
  return (Array.isArray(rows) ? rows : rows.data || []).map((row: Record<string, unknown>) => normalizeRide(row));
}

export async function getAllDriverRides(): Promise<DriverRide[]> {
  const rows = await request("/admin/driver-rides");
  return (Array.isArray(rows) ? rows : rows.data || []).map((row: Record<string, unknown>) => normalizeRide(row));
}

export async function saveDriverRide(driverId: string, input: DriverRideInput, rideId?: string) {
  const form = new FormData();
  Object.entries(input).forEach(([key, value]) => { if (key !== "paymentProofFile" && value !== undefined) form.append(key, String(value)); });
  if (input.paymentProofFile) form.append("paymentProof", input.paymentProofFile);
  const result = await request(`/admin/drivers/${driverId}/rides${rideId ? `/${rideId}` : ""}`, { method: "POST", body: form });
  return normalizeRide(result.ride || result);
}

export async function deleteDriverRide(driverId: string, rideId: string) {
  return request(driverId ? `/admin/drivers/${driverId}/rides/${rideId}` : `/admin/driver-rides/${rideId}`, { method: "DELETE" });
}

export async function deleteDriver(driverId: string) {
  return request(`/admin/driver-registrations/${driverId}`, { method: "DELETE" });
}

export async function updateDriverStatus(id: string, status: DriverRegistration["status"]) {
  return request(`/admin/driver-registrations/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function updateDriverRegistration(
  driver: DriverRegistration,
  files?: {
    vehiclePhotoFiles?: File[];
    driverDocumentFile?: File;
    insuranceDocumentFile?: File;
    password?: string;
  },
) {
  if (!/^\d+$/.test(driver.id)) {
    throw new Error("This application is not in the database. Submit it again through the registration portal.");
  }
  try {
    const fields = {
      fullName: driver.fullName,
      email: driver.email,
      phone: driver.phone,
      province: driver.province,
      district: driver.district,
      location: driver.location,
      vehicleCategory: driver.vehicleCategory,
      vehicleName: driver.vehicleName,
      vehicleRegistrationNumber: driver.vehicleRegistrationNumber,
      vehicleColour: driver.vehicleColour,
      seatCapacity: driver.seatCapacity,
      airConditioning: driver.airConditioning,
      status: driver.status,
    };
    const form = new FormData();
    if (files?.password?.trim()) form.append("password", files.password.trim());
    Object.entries(fields).forEach(([key, value]) => form.append(key, String(value)));
    files?.vehiclePhotoFiles?.forEach((file) => form.append("vehiclePhotos[]", file));
    if (files?.driverDocumentFile) form.append("driverDocument", files.driverDocumentFile);
    if (files?.insuranceDocumentFile) form.append("insuranceDocument", files.insuranceDocumentFile);
    const response = await request(`/admin/driver-registrations/${driver.id}`, {
      method: "POST",
      body: form,
    });
    return normalizeDriver(response.driver || driver);
  } catch (error) {
    throw error;
  }
}
