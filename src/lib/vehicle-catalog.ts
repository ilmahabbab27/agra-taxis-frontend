export type VehicleCategory = string;

export type DayPrices = {
  acNormal: number;
  acHill: number;
  nonAcNormal: number;
  nonAcHill: number;
};

export type PackagePrices = Record<string, DayPrices>;


export type PerKmPrices = {
  ac: {
    oneWay: {
      normal: number;
      hill: number;
    };
    roundTrip: {
      normal: number;
      hill: number;
    };
  };
  nonAc: {
    oneWay: {
      normal: number;
      hill: number;
    };
    roundTrip: {
      normal: number;
      hill: number;
    };
  };
};

export type StayPrices = {
  day1: number;
  day2: number;
  day3: number;
  day4: number;
  day5: number;
};

export type LorryRateWindow = {
  fromKm: number;
  toKm: number | null;
  start: number;
  extra: number;
};

export type LorryRateRow = {
  type: string;
  windows: LorryRateWindow[];
  upDown: number;
  waiting: number;
  waitingHour: number;
  maxUpDownKm: number;
  hillExtraPerKm: number;
};

export type LorryRates = Record<string, LorryRateRow>;

export type VehicleCatalogItem = {
  id?: number;
  name: string;
  category: VehicleCategory;
  img: string;
  img2?: string;
  img3?: string;
  img4?: string;
  img5?: string;
  images?: string[];
  seats: number;
  acPricePerKm: number;
  acHillPricePerKm: number;
  nonAcPricePerKm: number;
  nonAcHillPricePerKm: number;
  perKmPrices?: PerKmPrices;
  acAvailable: boolean;
  nonAcAvailable: boolean;
  package1Prices?: PackagePrices;
  stayPrices?: StayPrices;
  lorryRates?: LorryRates;
  isCustom?: boolean;
};

export type VehicleFormInput = Omit<VehicleCatalogItem, "isCustom">;

export const vehicleCategories: Array<"All" | VehicleCategory> = [
  "All",
  "Cars",
  "Vans",
  "SUVs",
  "Luxury",
  "Mini Buses",
  "Buses",
];

export const vehicles: VehicleCatalogItem[] = [];

const CUSTOM_VEHICLES_KEY = "agra_custom_vehicles_v1";
const DELETED_VEHICLES_KEY = "agra_deleted_vehicles_v1";
const CUSTOM_CATEGORIES_KEY = "agra_custom_vehicle_categories_v1";
const VEHICLE_CACHE_KEY = "agra_vehicle_cache_v1";
const LORRY_CACHE_KEY = "agra_lorry_cache_v1";
const DEFAULT_API_BASE = "http://localhost/Agra%20Taxis%20Backend/public/api";
const API_BASE = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE).replace(/\/$/, "");

export function getVehicles() {
  const deletedVehicleNames = getDeletedVehicleNames();
  return [
    ...vehicles.filter((vehicle) => !deletedVehicleNames.includes(vehicle.name)),
    ...getCustomVehicles(),
  ];
}

export function getVehicleCategories(): Array<"All" | VehicleCategory> {
  const names = [
    ...vehicleCategories.filter((category) => category !== "All"),
    ...getCustomCategories(),
    ...getVehicles().map((vehicle) => vehicle.category),
  ];
  return ["All", ...Array.from(new Set(names.filter(Boolean)))];
}

export async function getVehiclesFromDatabase() {
  const response = await fetch(`${API_BASE}/vehicles`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Vehicle API request failed");
  const payload = await response.json();
  if (!Array.isArray(payload.data)) return [];
  const vehicles = payload.data.map(normalizeApiVehicle) as VehicleCatalogItem[];
  setCache(VEHICLE_CACHE_KEY, vehicles);
  return vehicles;
}

export function getCachedVehiclesFromDatabase() {
  return getCache<VehicleCatalogItem[]>(VEHICLE_CACHE_KEY);
}

export async function getVehicleCategoriesFromDatabase(): Promise<Array<"All" | VehicleCategory>> {
  const response = await fetch(`${API_BASE}/vehicle-categories`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Vehicle categories API request failed");
  const payload = await response.json() as { data?: unknown };
  const categories = Array.isArray(payload.data)
    ? payload.data.filter((category: unknown): category is string => typeof category === "string")
    : [];
  return ["All", ...Array.from(new Set(categories))];
}

export async function getLorriesFromDatabase() {
  const response = await fetch(`${API_BASE}/lorries`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Lorry API request failed");
  const payload = await response.json() as { data?: unknown };
  const lorries = Array.isArray(payload.data) ? payload.data.map(normalizeApiVehicle) as VehicleCatalogItem[] : [];
  setCache(LORRY_CACHE_KEY, lorries);
  return lorries;
}

export function getCachedLorriesFromDatabase() {
  return getCache<VehicleCatalogItem[]>(LORRY_CACHE_KEY);
}

export async function saveVehicleToDatabase(vehicle: VehicleFormInput, id?: number) {
  const response = await fetch(id ? `${API_BASE}/vehicles/${id}` : `${API_BASE}/vehicles`, {
    method: id ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(normalizeVehicle(vehicle)),
  });
  if (!response.ok) throw new Error(await readApiError(response, "Save vehicle API request failed"));
  const payload = await response.json() as { data: VehicleCatalogItem };
  clearVehicleCache();
  return normalizeApiVehicle(payload.data) as VehicleCatalogItem;
}

export async function deleteVehicleFromDatabase(vehicle: VehicleCatalogItem) {
  if (!vehicle.id) {
    deleteVehicle(vehicle.name);
    return;
  }
  const response = await fetch(`${API_BASE}/vehicles/${vehicle.id}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Delete vehicle API request failed");
}

export async function saveLorryToDatabase(vehicle: VehicleFormInput, id?: number) {
  const payload = {
    name: vehicle.name,
    category: vehicle.category || "Lorries",
    img: vehicle.img,
    img2: vehicle.img2,
    img3: vehicle.img3,
    img4: vehicle.img4,
    img5: vehicle.img5,
    rateTable: vehicle.lorryRates,
  };

  const response = await fetch(id ? `${API_BASE}/lorries/${id}` : `${API_BASE}/lorries`, {
    method: id ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await readApiError(response, "Save lorry API request failed"));
  const result = await response.json() as { data: VehicleCatalogItem };
  clearVehicleCache();
  return normalizeApiVehicle(result.data) as VehicleCatalogItem;
}

export async function saveCategoryToDatabase(category: string) {
  const response = await fetch(`${API_BASE}/vehicle-categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ name: category.trim() }),
  });
  if (!response.ok) throw new Error(await readApiError(response, "Save category API request failed"));
  return response.json() as Promise<{ data: string }>;
}

async function readApiError(response: Response, fallback: string) {
  try {
    const payload = await response.json() as { message?: unknown; errors?: Record<string, unknown> };
    const message = typeof payload.message === "string" ? payload.message : fallback;
    const errors = payload.errors && typeof payload.errors === "object"
      ? Object.values(payload.errors)
          .flatMap((value) => Array.isArray(value) ? value : [value])
          .filter((value): value is string => typeof value === "string")
      : [];
    return errors.length ? `${message}: ${errors.join(" ")}` : message;
  } catch {
    return fallback;
  }
}

export function getCustomCategories() {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(CUSTOM_CATEGORIES_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((category): category is string => typeof category === "string");
  } catch {
    return [];
  }
}

export function saveCustomCategory(category: string) {
  const normalized = category.trim();
  if (!normalized) return getCustomCategories();
  const next = Array.from(new Set([...getCustomCategories(), normalized]));
  localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(next));
  return next;
}

export function getCustomVehicles() {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(CUSTOM_VEHICLES_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.map((vehicle) => ({ ...vehicle, isCustom: true })) as VehicleCatalogItem[];
  } catch {
    return [];
  }
}

export function saveCustomVehicle(vehicle: VehicleFormInput) {
  const normalized = normalizeVehicle(vehicle);
  const customVehicles = getCustomVehicles().filter((item) => item.name !== normalized.name);
  const next = [...customVehicles, { ...normalized, isCustom: true }];
  const deletedVehicleNames = getDeletedVehicleNames();
  if (vehicles.some((item) => item.name === normalized.name)) {
    setDeletedVehicleNames([...deletedVehicleNames, normalized.name]);
  }
  localStorage.setItem(CUSTOM_VEHICLES_KEY, JSON.stringify(next));
  return next;
}

export function deleteCustomVehicle(name: string) {
  const next = getCustomVehicles().filter((vehicle) => vehicle.name !== name);
  localStorage.setItem(CUSTOM_VEHICLES_KEY, JSON.stringify(next));
  return next;
}

export function deleteVehicle(name: string) {
  deleteCustomVehicle(name);
  if (vehicles.some((vehicle) => vehicle.name === name)) {
    setDeletedVehicleNames([...getDeletedVehicleNames(), name]);
  }
}

export function getVehicleByName(name: string, source: VehicleCatalogItem[] = getVehicles()) {
  return source.find((vehicle) => vehicle.name === name) || source[0] || vehicles[0];
}

export function getPricePerKm(
  vehicle: VehicleCatalogItem,
  ac: string,
  trip: string = "One Way",
  isHillCountry = false,
) {
  const isRoundTrip = trip === "Round Trip";
  if (ac === "Non AC") {
    return isRoundTrip
      ? (isHillCountry
          ? vehicle.perKmPrices?.nonAc.roundTrip.hill
          : vehicle.perKmPrices?.nonAc.roundTrip.normal) ?? vehicle.nonAcPricePerKm
      : (isHillCountry
          ? vehicle.perKmPrices?.nonAc.oneWay.hill
          : vehicle.perKmPrices?.nonAc.oneWay.normal) ?? vehicle.nonAcPricePerKm;
  }
  return isRoundTrip
    ? (isHillCountry
        ? vehicle.perKmPrices?.ac.roundTrip.hill
        : vehicle.perKmPrices?.ac.roundTrip.normal) ?? vehicle.acPricePerKm
    : (isHillCountry
        ? vehicle.perKmPrices?.ac.oneWay.hill
        : vehicle.perKmPrices?.ac.oneWay.normal) ?? vehicle.acPricePerKm;
}

export function formatLkr(value: number) {
  return `Rs. ${Math.round(value).toLocaleString("en-LK")}`;
}

function getDeletedVehicleNames() {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(DELETED_VEHICLES_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((name): name is string => typeof name === "string");
  } catch {
    return [];
  }
}

function setDeletedVehicleNames(names: string[]) {
  const uniqueNames = Array.from(new Set(names));
  localStorage.setItem(DELETED_VEHICLES_KEY, JSON.stringify(uniqueNames));
}


function normalizePackagePrices(raw: unknown): PackagePrices {
  const s = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const dayKeys = Object.keys(s).filter((key) => /^day\d+$/.test(key));
  const keys = dayKeys.length ? dayKeys : ["day1"];

  return keys
    .sort((a, b) => Number(a.replace("day", "")) - Number(b.replace("day", "")))
    .reduce<PackagePrices>((normalized, key) => {
    const row = s[key] && typeof s[key] === "object" ? (s[key] as Record<string, unknown>) : {};
      normalized[key] = {
      acNormal: Math.max(0, Number(row.acNormal) || 0),
      acHill: Math.max(0, Number(row.acHill) || 0),
      nonAcNormal: Math.max(0, Number(row.nonAcNormal) || 0),
      nonAcHill: Math.max(0, Number(row.nonAcHill) || 0),
    };
      return normalized;
    }, {});
}

function normalizePerKmPrices(raw: unknown): PerKmPrices {
  const s = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const ac = s.ac && typeof s.ac === "object" ? (s.ac as Record<string, unknown>) : {};
  const nonAc = s.nonAc && typeof s.nonAc === "object" ? (s.nonAc as Record<string, unknown>) : {};
  const oneWay = (row: unknown) => (row && typeof row === "object" ? (row as Record<string, unknown>) : {});
  return {
    ac: {
      oneWay: {
        normal: Math.max(0, Number(oneWay(ac.oneWay).normal) || 0),
        hill: Math.max(0, Number(oneWay(ac.oneWay).hill) || 0),
      },
      roundTrip: {
        normal: Math.max(0, Number(oneWay(ac.roundTrip).normal) || 0),
        hill: Math.max(0, Number(oneWay(ac.roundTrip).hill) || 0),
      },
    },
    nonAc: {
      oneWay: {
        normal: Math.max(0, Number(oneWay(nonAc.oneWay).normal) || 0),
        hill: Math.max(0, Number(oneWay(nonAc.oneWay).hill) || 0),
      },
      roundTrip: {
        normal: Math.max(0, Number(oneWay(nonAc.roundTrip).normal) || 0),
        hill: Math.max(0, Number(oneWay(nonAc.roundTrip).hill) || 0),
      },
    },
  };
}

function normalizeVehicle(vehicle: VehicleFormInput): VehicleFormInput {
  const acAvailable = vehicle.acAvailable || !vehicle.nonAcAvailable;
  return {
    ...vehicle,
    name: vehicle.name.trim(),
    category: vehicle.category.trim() || "Cars",
    img: vehicle.img.trim() || "/assets/car.jpg",
    img2: vehicle.img2?.trim() || undefined,
    img3: vehicle.img3?.trim() || undefined,
    img4: vehicle.img4?.trim() || undefined,
    img5: vehicle.img5?.trim() || undefined,
    seats: Math.max(1, Number(vehicle.seats) || 1),
    acPricePerKm: acAvailable ? Math.max(0, Number(vehicle.acPricePerKm) || 0) : 0,
    acHillPricePerKm: acAvailable ? Math.max(0, Number(vehicle.acHillPricePerKm) || 0) : 0,
    nonAcPricePerKm: vehicle.nonAcAvailable ? Math.max(0, Number(vehicle.nonAcPricePerKm) || 0) : 0,
    nonAcHillPricePerKm: vehicle.nonAcAvailable ? Math.max(0, Number(vehicle.nonAcHillPricePerKm) || 0) : 0,
    perKmPrices: normalizePerKmPrices(vehicle.perKmPrices),
    acAvailable,
    nonAcAvailable: vehicle.nonAcAvailable,
    package1Prices: normalizePackagePrices(vehicle.package1Prices),
    lorryRates: normalizeLorryRates(vehicle.lorryRates),
  };
}

const BACKEND_ORIGIN = API_BASE.replace(/\/api$/, "");

function resolveImgUrl(img: unknown): string {
  const raw = String(img || "");
  if (!raw) return "/assets/car.jpg";
  if (raw.startsWith("data:") || raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  // uploaded vehicle image served from the backend public folder
  if (raw.startsWith("/vehicles/") || raw.startsWith("/storage/")) return BACKEND_ORIGIN + raw;
  return raw;
}

function normalizeApiVehicle(vehicle: Partial<VehicleCatalogItem>) {
  const readNumber = (...values: unknown[]) =>
    values.reduce<number>((result, value) => {
      if (result > 0) return result;
      const next = Math.max(0, Number(value) || 0);
      return next;
    }, 0);
  return {
    id: vehicle.id,
    name: String(vehicle.name || ""),
    category: String(vehicle.category || "Cars"),
    img: resolveImgUrl(vehicle.img),
    img2: vehicle.img2 ? resolveImgUrl(vehicle.img2) : undefined,
    img3: vehicle.img3 ? resolveImgUrl(vehicle.img3) : undefined,
    img4: vehicle.img4 ? resolveImgUrl(vehicle.img4) : undefined,
    img5: vehicle.img5 ? resolveImgUrl(vehicle.img5) : undefined,
    images: Array.isArray((vehicle as Record<string, unknown>).images)
      ? ((vehicle as Record<string, unknown>).images as unknown[]).map((image) => resolveImgUrl(image)).filter(Boolean)
      : undefined,
    seats: Math.max(1, Number(vehicle.seats) || 1),
    acPricePerKm: readNumber(vehicle.acPricePerKm, (vehicle as Record<string, unknown>).ac_price_per_km),
    acHillPricePerKm: readNumber(vehicle.acHillPricePerKm, (vehicle as Record<string, unknown>).ac_hill_price_per_km),
    nonAcPricePerKm: readNumber(vehicle.nonAcPricePerKm, (vehicle as Record<string, unknown>).non_ac_price_per_km),
    nonAcHillPricePerKm: readNumber(vehicle.nonAcHillPricePerKm, (vehicle as Record<string, unknown>).non_ac_hill_price_per_km),
    perKmPrices: normalizePerKmPrices(vehicle.perKmPrices ?? (vehicle as Record<string, unknown>).per_km_prices),
    acAvailable: Boolean(vehicle.acAvailable ?? (vehicle as Record<string, unknown>).ac_available),
    nonAcAvailable: Boolean(vehicle.nonAcAvailable ?? (vehicle as Record<string, unknown>).non_ac_available),
    package1Prices: normalizePackagePrices(vehicle.package1Prices ?? (vehicle as Record<string, unknown>).package1_prices),
    lorryRates: normalizeLorryRates(
      vehicle.lorryRates
      ?? (vehicle as Record<string, unknown>).rateTable
      ?? (vehicle as Record<string, unknown>).rate_table
      ?? (vehicle as Record<string, unknown>).lorry_rates,
    ),
  };
}

function normalizeLorryRates(raw: unknown): LorryRates {
  const s = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return Object.entries(s).reduce<LorryRates>((normalized, [key, row]) => {
    const data = row && typeof row === "object" ? (row as Record<string, unknown>) : {};

    let windows: LorryRateWindow[] = [];
    if (Array.isArray(data.windows)) {
      windows = (data.windows as unknown[]).map((w: unknown) => {
        const window = w && typeof w === "object" ? (w as Record<string, unknown>) : {};
        return {
          fromKm: Math.max(0, Number(window.fromKm) || 0),
          toKm: window.toKm === null ? null : (window.toKm ? Math.max(0, Number(window.toKm)) : null),
          start: Math.max(0, Number(window.start) || 0),
          extra: Math.max(0, Number(window.extra) || 0),
        };
      });
    } else if (data.start || data.startFeeLimit) {
      windows = [{
        fromKm: 0,
        toKm: Math.max(0, Number(data.startFeeLimit ?? 130) || 0),
        start: Math.max(0, Number(data.start) || 0),
        extra: Math.max(0, Number(data.extra) || 0),
      }];
    }

    if (windows.length === 0) {
      windows = [{ fromKm: 0, toKm: null, start: 0, extra: 0 }];
    }

    normalized[key] = {
      type: String(data.type || key),
      windows,
      upDown: Math.max(0, Number(data.upDown ?? data.up_down) || 0),
      waiting: Math.max(0, Number(data.waiting) || 0),
      waitingHour: Math.max(0, Number(data.waitingHour ?? data.waiting_hour) || 0),
      maxUpDownKm: Math.max(0, Number(data.maxUpDownKm ?? data.max_up_down_km ?? 150) || 0),
      hillExtraPerKm: Math.max(0, Number(data.hillExtraPerKm ?? data.hill_extra_per_km ?? 10) || 0),
    };
    return normalized;
  }, {});
}

export function clearVehicleCache() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(VEHICLE_CACHE_KEY);
  localStorage.removeItem(LORRY_CACHE_KEY);
}

function getCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const payload = localStorage.getItem(key);
    if (!payload) return null;
    const parsed = JSON.parse(payload) as { value?: T; expiresAt?: number };
    if (!parsed || typeof parsed.expiresAt !== "number" || Date.now() > parsed.expiresAt) return null;
    return parsed.value ?? null;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        value,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      }),
    );
  } catch {
    // Ignore storage failures.
  }
}
