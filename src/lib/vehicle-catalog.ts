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

export type VehicleCatalogItem = {
  id?: number;
  name: string;
  category: VehicleCategory;
  img: string;
  img2?: string;
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
  return payload.data.map(normalizeApiVehicle) as VehicleCatalogItem[];
}

export async function getVehicleCategoriesFromDatabase(): Promise<Array<"All" | VehicleCategory>> {
  const response = await fetch(`${API_BASE}/vehicle-categories`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Vehicle categories API request failed");
  const payload = await response.json();
  const categories = Array.isArray(payload.data)
    ? payload.data.filter((category: unknown): category is string => typeof category === "string")
    : [];
  return ["All", ...Array.from(new Set(categories))];
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
  if (!response.ok) throw new Error("Save vehicle API request failed");
  const payload = await response.json();
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

export async function saveCategoryToDatabase(category: string) {
  const response = await fetch(`${API_BASE}/vehicle-categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ name: category.trim() }),
  });
  if (!response.ok) throw new Error("Save category API request failed");
  return response.json();
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

function normalizeStayPrices(raw: unknown): StayPrices {
  const s = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    day1: Math.max(0, Number(s.day1) || 0),
    day2: Math.max(0, Number(s.day2) || 0),
    day3: Math.max(0, Number(s.day3) || 0),
    day4: Math.max(0, Number(s.day4) || 0),
    day5: Math.max(0, Number(s.day5) || 0),
  };
}

function emptyDayPrices(): DayPrices {
  return { acNormal: 0, acHill: 0, nonAcNormal: 0, nonAcHill: 0 };
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
    seats: Math.max(1, Number(vehicle.seats) || 1),
    acPricePerKm: acAvailable ? Math.max(0, Number(vehicle.acPricePerKm) || 0) : 0,
    acHillPricePerKm: acAvailable ? Math.max(0, Number(vehicle.acHillPricePerKm) || 0) : 0,
    nonAcPricePerKm: vehicle.nonAcAvailable ? Math.max(0, Number(vehicle.nonAcPricePerKm) || 0) : 0,
    nonAcHillPricePerKm: vehicle.nonAcAvailable ? Math.max(0, Number(vehicle.nonAcHillPricePerKm) || 0) : 0,
    perKmPrices: normalizePerKmPrices(vehicle.perKmPrices),
    acAvailable,
    nonAcAvailable: vehicle.nonAcAvailable,
    package1Prices: normalizePackagePrices(vehicle.package1Prices),
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
  return {
    id: vehicle.id,
    name: String(vehicle.name || ""),
    category: String(vehicle.category || "Cars"),
    img: resolveImgUrl(vehicle.img),
    img2: vehicle.img2 ? resolveImgUrl(vehicle.img2) : undefined,
    seats: Math.max(1, Number(vehicle.seats) || 1),
    acPricePerKm: Math.max(0, Number(vehicle.acPricePerKm) || 0),
    acHillPricePerKm: Math.max(0, Number(vehicle.acHillPricePerKm) || 0),
    nonAcPricePerKm: Math.max(0, Number(vehicle.nonAcPricePerKm) || 0),
    nonAcHillPricePerKm: Math.max(0, Number(vehicle.nonAcHillPricePerKm) || 0),
    perKmPrices: normalizePerKmPrices(vehicle.perKmPrices),
    acAvailable: Boolean(vehicle.acAvailable),
    nonAcAvailable: Boolean(vehicle.nonAcAvailable),
    package1Prices: normalizePackagePrices(vehicle.package1Prices),
  };
}
