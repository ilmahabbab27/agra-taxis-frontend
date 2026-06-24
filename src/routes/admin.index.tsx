import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Car, Download, LogOut, Pencil, Plus, Trash2, Loader2, RotateCw } from "lucide-react";
import { adminLogout, isAdminAuthed } from "@/lib/admin-store";
import { API_BASE } from "@/lib/api";
import { EMAIL, PHONE, PHONE_DISPLAY, WHATSAPP } from "@/lib/contact";
import {
  deleteVehicle,
  deleteVehicleFromDatabase,
  formatLkr,
  getVehicleCategories,
  getVehicleCategoriesFromDatabase,
  getLorriesFromDatabase,
  getVehiclesFromDatabase,
  getVehicles,
  saveCustomCategory,
  saveCustomVehicle,
  saveCategoryToDatabase,
  saveVehicleToDatabase,
  saveLorryToDatabase,
  type DayPrices,
  type LorryRateRow,
  type LorryRates,
  type PackagePrices,
  type PerKmPrices,
  type VehicleCatalogItem,
  type VehicleFormInput,
} from "@/lib/vehicle-catalog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const logo = "/assets/logo.jpg";
const driverSignature = "/assets/image.png";

export { AdminDashboard as default };

const adminInputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-3 text-sm text-charcoal outline-none focus:ring-2 focus:ring-gold disabled:cursor-not-allowed disabled:opacity-60";

const emptyDayPrices: DayPrices = { acNormal: 0, acHill: 0, nonAcNormal: 0, nonAcHill: 0 };
const emptyPerKmPrices: PerKmPrices = {
  ac: { oneWay: { normal: 0, hill: 0 }, roundTrip: { normal: 0, hill: 0 } },
  nonAc: { oneWay: { normal: 0, hill: 0 }, roundTrip: { normal: 0, hill: 0 } },
};
const emptyPackagePrices: PackagePrices = {
  day1: { ...emptyDayPrices },
};
const emptyLorryRates: LorryRates = {
  "7ft": { type: "7 FT", windows: [{ fromKm: 0, toKm: 130, rate: 2500, extraPerKm: 160, hillExtraPerKm: 10 }], upDownNonHill: 120, upDownHill: 200 },
  "20ft": { type: "20 FT", windows: [{ fromKm: 0, toKm: 130, rate: 18000, extraPerKm: 450, hillExtraPerKm: 10 }], upDownNonHill: 300, upDownHill: 500 },
  "8.5ft": { type: "8.5 FT", windows: [{ fromKm: 0, toKm: 130, rate: 3500, extraPerKm: 180, hillExtraPerKm: 10 }], upDownNonHill: 130, upDownHill: 220 },
  "10.5ft": { type: "10.5 FT", windows: [{ fromKm: 0, toKm: 130, rate: 6000, extraPerKm: 230, hillExtraPerKm: 10 }], upDownNonHill: 170, upDownHill: 280 },
  "12.5ft": { type: "12.5 FT", windows: [{ fromKm: 0, toKm: 130, rate: 7500, extraPerKm: 250, hillExtraPerKm: 10 }], upDownNonHill: 180, upDownHill: 300 },
  "14.5ft": { type: "14.5 FT", windows: [{ fromKm: 0, toKm: 130, rate: 10000, extraPerKm: 320, hillExtraPerKm: 10 }], upDownNonHill: 210, upDownHill: 350 },
  "16.5ft": { type: "16.5 FT", windows: [{ fromKm: 0, toKm: 130, rate: 11000, extraPerKm: 330, hillExtraPerKm: 10 }], upDownNonHill: 220, upDownHill: 360 },
};

const emptyVehicleForm: VehicleFormInput = {
  name: "",
  category: "Cars",
  img: "/assets/car.jpg",
  img2: undefined,
  seats: 4,
  acPricePerKm: 0,
  acHillPricePerKm: 0,
  nonAcPricePerKm: 0,
  nonAcHillPricePerKm: 0,
  perKmPrices: { ...emptyPerKmPrices },
  acAvailable: true,
  nonAcAvailable: true,
  package1Prices: { ...emptyPackagePrices },
  lorryRates: { ...emptyLorryRates },
  vehicleCostPerDay: 0,
  driverChargePerDay: 0,
  fuelPricePerLiter: 0,
  normalKmPerLiter: 0,
  hillKmPerLiter: 0,
  includeOperatingCosts: false,
  commissionRate: 0,
};

function getPackageDayKeys(prices: PackagePrices): Array<keyof PackagePrices> {
  const keys = Object.keys(prices).filter((key) => /^day\d+$/.test(key));
  return (keys.length ? keys : ["day1"]).sort(
    (a, b) => Number(a.replace("day", "")) - Number(b.replace("day", "")),
  );
}

function getPackageDayNumbers(prices: PackagePrices): number[] {
  return getPackageDayKeys(prices).map((key) => Number(String(key).replace("day", "")));
}

type AdminTab = "vehicles" | "lorries" | "invoices";
type ImageSlot = "img" | "img2" | "img3" | "img4" | "img5";
type LorryImageForm = Pick<VehicleFormInput, ImageSlot>;

type QuotationForm = {
  documentType: "Quotation" | "Invoice";
  date: string;
  vehicleNo: string;
  cabNo: string;
  tel: string;
  customerName: string;
  vehicle: string;
  description: string;
  pickup: string;
  destination: string;
  days: string;
  noOfKms: string;
  meterReadingStart: string;
  meterReadingEnd: string;
  firstKms: string;
  extraKms: string;
  packageHours: string;
  packageWith: string;
  extraHours: string;
  loadingCharges: string;
  pickupCharges: string;
  rate: string;
  amount: string;
  notes: string;
};

const emptyQuotationForm: QuotationForm = {
  documentType: "Quotation",
  date: "",
  vehicleNo: "",
  cabNo: "",
  tel: "",
  customerName: "",
  vehicle: "",
  description: "",
  pickup: "",
  destination: "",
  days: "1",
  noOfKms: "",
  meterReadingStart: "",
  meterReadingEnd: "",
  firstKms: "",
  extraKms: "",
  packageHours: "",
  packageWith: "",
  extraHours: "",
  loadingCharges: "",
  pickupCharges: "",
  rate: "",
  amount: "",
  notes: "",
};

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatQuotationMoney(value: string, fallback = "") {
  if (!value.trim()) return fallback;
  const numericValue = Number(value.replace(/,/g, "").trim());
  if (!Number.isFinite(numericValue)) return value;
  return `Rs. ${numericValue.toLocaleString("en-LK")}`;
}

function formatQuotationNumber(value: string, fallback = "0") {
  if (!value.trim()) return fallback;
  const numericValue = Number(value.replace(/,/g, "").trim());
  if (!Number.isFinite(numericValue)) return value;
  return numericValue.toLocaleString("en-LK");
}

function printQuotationDraft(form: QuotationForm) {
  if (typeof window === "undefined") return;
  const popup = window.open("", "_blank", "width=900,height=1200");
  if (!popup) return;
  const issueDate = form.date || new Date().toLocaleDateString();
  const issueTime = new Date().toLocaleTimeString();
  const ref = `${form.documentType === "Invoice" ? "INV" : "Q"}-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  const amount = formatQuotationNumber(form.amount);
  const rate = formatQuotationMoney(form.rate);
  const esc = escapeHtml;

  popup.document.write(`
    <html><head><title>${ref}</title><style>
      @page { size: A4; margin: 14mm; }
      * { box-sizing: border-box; }
      body { font-family: Arial, sans-serif; margin: 0; color: #111827; background: #fff; }
      .page { width: 100%; max-width: 760px; margin: 0 auto; }
      .header { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; }
      .brand { display:flex; align-items:center; gap:12px; min-width:0; }
      .logo { width:72px; height:72px; object-fit:contain; border:1px solid #d1d5db; background:#fff; flex:0 0 auto; }
      .titleblock { min-width:0; }
      .titleblock h1 { margin:0; font-size:24px; line-height:1.1; }
      .titleblock p { margin:4px 0 0; max-width:360px; font-size:11px; color:#4b5563; line-height:1.4; white-space:normal; }
      .meta { text-align:right; font-size:11px; line-height:1.5; color:#374151; }
      .rule { border-top:1px solid #111827; margin:10px 0 14px; }
      .line-row { font-size:11px; margin:8px 0; line-height:1.5; }
      .line { display:inline-block; min-width:120px; border-bottom:1px solid #111827; min-height:14px; vertical-align:bottom; }
      .line.xl { min-width:360px; }
      table { width:100%; border-collapse:collapse; margin-top:12px; font-size:11px; }
      th, td { border:1px solid #111827; padding:7px 8px; vertical-align:top; }
      th { text-align:left; background:#f3f4f6; }
      .sig { display:flex; justify-content:space-between; gap:28px; margin-top:34px; }
      .sig > div { position:relative; flex:1; text-align:center; font-size:11px; }
      .signature-img { position:absolute; left:50%; bottom:22px; transform:translateX(-50%); width:120px; height:42px; object-fit:contain; }
      .sigline { margin-top:34px; border-top:1px solid #111827; padding-top:6px; }
      .small { font-size:10px; color:#4b5563; }
    </style></head><body><div class="page">
      <div class="header"><div class="brand"><img class="logo" src="${logo}" alt="Agra Taxis" /><div class="titleblock"><h1>Agra Taxis</h1><p>Sri Lanka's trusted islandwide vehicle rental and taxi service<br/>${form.documentType}</p></div></div><div class="meta"><div><strong>${ref}</strong></div><div>DATE : ${esc(issueDate)}</div><div>TIME : ${issueTime}</div></div></div>
      <div class="rule"></div>
      <div class="line-row">DATE : <span class="line">${esc(issueDate)}</span> VEHICLE NO : <span class="line">${esc(form.vehicleNo)}</span> CAB NO. : <span class="line">${esc(form.cabNo)}</span> TEL : <span class="line">${esc(form.tel)}</span></div>
      <div class="line-row">Customer's Name : <span class="line xl">${esc(form.customerName)}</span></div>
      <div class="line-row">Description : <span class="line xl">${esc(form.description || form.vehicle)}</span></div>
      <div class="line-row">No. Of Kms : <span class="line xl">${esc(form.noOfKms || form.days)}</span></div>
      <div class="line-row">Meter Reading Start : <span class="line xl">${esc(form.meterReadingStart)}</span></div>
      <div class="line-row">Meter Reading End : <span class="line xl">${esc(form.meterReadingEnd)}</span></div>
      <table><thead><tr><th style="width:55%;">DESCRIPTION</th><th style="width:22%;">RATE</th><th style="width:23%;">AMOUNT</th></tr></thead><tbody>
        <tr><td>For First ${esc(form.firstKms || "..............................")} Kms</td><td>${esc(rate)}</td><td>Rs. ${amount}</td></tr>
        <tr><td>Extra Additional ${esc(form.extraKms || "...............................")} Kms</td><td>${esc(rate)}</td><td>${esc(formatQuotationMoney(form.extraKms))}</td></tr>
        <tr><td>${esc(form.packageHours || "............................")} Hrs Package With ${esc(form.packageWith || "............................")}</td><td>${esc(rate)}</td><td></td></tr>
        <tr><td>Extra Additional ${esc(form.extraHours || "...............................")} Hrs</td><td>${esc(rate)}</td><td></td></tr>
        <tr><td>Loading Charges</td><td></td><td>${esc(formatQuotationMoney(form.loadingCharges))}</td></tr>
        <tr><td>Pickup Charges</td><td></td><td>${esc(formatQuotationMoney(form.pickupCharges))}</td></tr>
        <tr><td><strong>Total</strong></td><td></td><td><strong>Rs. ${amount}</strong></td></tr>
      </tbody></table>
      ${form.notes ? `<div class="line-row" style="margin-top:12px;"><strong>Notes:</strong> ${esc(form.notes)}</div>` : ""}
      <div class="sig"><div><div class="sigline">Customer's Signature</div></div><div><img class="signature-img" src="${driverSignature}" alt="Driver signature" /><div class="sigline">Driver's Sig</div></div></div>
      <div class="small" style="margin-top:16px;">Generated from the admin panel. Save or print as PDF from the browser dialog.</div>
    </div><script>window.onload = () => { window.print(); setTimeout(() => window.close(), 250); };</script></body></html>
  `);
  popup.document.close();
}

function AdminField({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-charcoal mb-2">{label}</label>
      {children}
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [adminVehicles, setAdminVehicles] = useState<VehicleCatalogItem[]>([]);
  const [vehicleForm, setVehicleForm] = useState<VehicleFormInput>(emptyVehicleForm);
  const [categoryOptions, setCategoryOptions] = useState<Array<"All" | string>>([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingVehicleName, setEditingVehicleName] = useState<string | null>(null);
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<VehicleCatalogItem | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"All" | string>("All");
  const [seatFilter, setSeatFilter] = useState("all");
  const [comfortFilter, setComfortFilter] = useState<"all" | "ac" | "nonAc">("all");
  const [activeTab, setActiveTab] = useState<AdminTab>("vehicles");
  const [quotationForm, setQuotationForm] = useState<QuotationForm>(emptyQuotationForm);
  const [lorryRates, setLorryRates] = useState<LorryRates>(emptyLorryRates);
  const [allLorryRates, setAllLorryRates] = useState<Map<string, LorryRates>>(new Map());
  const [lorryImageForm, setLorryImageForm] = useState<LorryImageForm>({
    img: "/assets/car.jpg",
    img2: undefined,
    img3: undefined,
    img4: undefined,
    img5: undefined,
  });
  const [isLorryEditing, setIsLorryEditing] = useState(false);
  const [lorrySaveStatus, setLorrySaveStatus] = useState("");
  const [ready, setReady] = useState(false);
  const [imageUploading, setImageUploading] = useState<"img" | "img2" | null>(null);
  const [lorryImageUploading, setLorryImageUploading] = useState<ImageSlot | null>(null);
  const [vehicleSaveError, setVehicleSaveError] = useState("");
  const [vehicleSaving, setVehicleSaving] = useState(false);
  const [currentLorry, setCurrentLorry] = useState<VehicleCatalogItem | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<VehicleFormInput>(emptyVehicleForm);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [savingLorryImages, setSavingLorryImages] = useState(false);
  const [savingLorryRates, setSavingLorryRates] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);

  const lorryImageRefs = {
    img: useRef<HTMLInputElement>(null),
    img2: useRef<HTMLInputElement>(null),
    img3: useRef<HTMLInputElement>(null),
    img4: useRef<HTMLInputElement>(null),
    img5: useRef<HTMLInputElement>(null),
  };

  const vehicleImageRefs = {
    img: useRef<HTMLInputElement>(null),
    img2: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    if (!isAdminAuthed()) {
      navigate("/admin/login");
      return;
    }
    void refreshVehicles();
    setReady(true);
  }, [navigate]);

  // Auto-select first lorry if none selected
  useEffect(() => {
    if (!currentLorry && activeTab === "lorries") {
      const lorries = adminVehicles.filter(v => v.category.toLowerCase().includes("lorry"));
      if (lorries.length > 0) {
        const firstLorry = lorries[0];
        setCurrentLorry(firstLorry);
        setLorryRates(firstLorry.lorryRates ?? emptyLorryRates);
        setLorryImageForm({
          img: firstLorry.img,
          img2: firstLorry.img2,
          img3: firstLorry.img3,
          img4: firstLorry.img4,
          img5: firstLorry.img5,
        });
      }
    }
  }, [activeTab, adminVehicles, currentLorry]);

  async function refreshVehicles() {
    setLoadingVehicles(true);
    try {
      const [vehicles, categories, lorries] = await Promise.all([
        getVehiclesFromDatabase(),
        getVehicleCategoriesFromDatabase(),
        getLorriesFromDatabase(),
      ]);
      setLoadingVehicles(false);
      const byName = new Map<string, VehicleCatalogItem>();
      [...vehicles, ...lorries].forEach((vehicle) => byName.set(vehicle.name, vehicle));

      // Set adminVehicles with ALL vehicles (passenger + lorries)
      const allVehicles = Array.from(byName.values());
      setAdminVehicles(allVehicles);

      // Load consolidated lorry rates from "Agra Lorries" (all types in one JSON)
      const agraLorries = lorries.find((v) => v.name === "Agra Lorries");
      const allRates = new Map<string, LorryRates>();
      if (agraLorries?.lorryRates && Object.keys(agraLorries.lorryRates).length > 0) {
        allRates.set("Agra Lorries", agraLorries.lorryRates);
      }
      setAllLorryRates(allRates);

      // Always prioritize "Agra Lorries" (consolidated vehicle from database)
      let nextLorry: VehicleCatalogItem | undefined = lorries.find((v) => v.name === "Agra Lorries");
      if (!nextLorry) {
        nextLorry = currentLorry ? allVehicles.find(v => v.name === currentLorry.name) : undefined;
      }
      if (!nextLorry) {
        nextLorry = lorries.find((vehicle) => vehicle.lorryRates && Object.keys(vehicle.lorryRates).length);
      }
      if (!nextLorry) {
        nextLorry = lorries[0];
      }

      setCurrentLorry(nextLorry);
      // Use only database rates, no fallback defaults
      if (nextLorry?.lorryRates && Object.keys(nextLorry.lorryRates).length > 0) {
        setLorryRates(nextLorry.lorryRates);
      } else {
        setLorryRates({});
      }
      if (nextLorry) {
        setLorryImageForm({
          img: nextLorry.img,
          img2: nextLorry.img2,
          img3: nextLorry.img3,
          img4: nextLorry.img4,
          img5: nextLorry.img5,
        });
      }
      setCategoryOptions(categories);
    } catch {
      const fallbackVehicles = getVehicles();
      setAdminVehicles(fallbackVehicles);
      const firstLorry = fallbackVehicles.find((vehicle) => vehicle.name === "Agra Lorries")
        ?? fallbackVehicles.find((vehicle) => vehicle.category.toLowerCase().includes("lorry"));
      if (firstLorry) {
        setCurrentLorry(firstLorry);
        setLorryRates(firstLorry.lorryRates && Object.keys(firstLorry.lorryRates).length > 0 ? firstLorry.lorryRates : {});
        setLorryImageForm({
          img: firstLorry.img,
          img2: firstLorry.img2,
          img3: firstLorry.img3,
          img4: firstLorry.img4,
          img5: firstLorry.img5,
        });
      }
      setCategoryOptions(getVehicleCategories());
      setLoadingVehicles(false);
    }
  }

  function updateVehicleForm<K extends keyof VehicleFormInput>(key: K, value: VehicleFormInput[K]) {
    setVehicleSaveError("");
    setVehicleForm((current) => ({ ...current, [key]: value }));
  }

  function updateQuotationForm<K extends keyof QuotationForm>(key: K, value: QuotationForm[K]) {
    setQuotationForm((current) => ({ ...current, [key]: value }));
  }

  function onQuotationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    printQuotationDraft(quotationForm);
  }

  function updatePackagePrice(
    day: keyof PackagePrices,
    priceKey: keyof DayPrices,
    value: number,
  ) {
    setVehicleForm((current) => ({
      ...current,
      package1Prices: {
        ...(current.package1Prices ?? emptyPackagePrices),
        [day]: {
          ...((current.package1Prices ?? emptyPackagePrices)[day] ?? emptyDayPrices),
          [priceKey]: value,
        },
      },
    }));
  }

  function addPackageDay() {
    setVehicleForm((current) => {
      const prices = current.package1Prices ?? emptyPackagePrices;
      const nextDayNumber = getPackageDayNumbers(prices).at(-1)! + 1;
      return {
        ...current,
        package1Prices: {
          ...prices,
          [`day${nextDayNumber}`]: { ...emptyDayPrices },
        },
      };
    });
  }

  function removePackageDay(day: keyof PackagePrices) {
    setVehicleForm((current) => {
      const prices = { ...(current.package1Prices ?? emptyPackagePrices) };
      const dayKeys = getPackageDayKeys(prices);
      if (dayKeys.length <= 1) return current;
      delete prices[day];
      return { ...current, package1Prices: prices };
    });
  }

  function updatePerKmPrice(
    group: "ac" | "nonAc",
    trip: "oneWay" | "roundTrip",
    kind: "normal" | "hill",
    value: number,
  ) {
    setVehicleForm((current) => ({
      ...current,
      perKmPrices: {
        ...(current.perKmPrices ?? emptyPerKmPrices),
        [group]: {
          ...((current.perKmPrices ?? emptyPerKmPrices)[group]),
          [trip]: {
            ...((current.perKmPrices ?? emptyPerKmPrices)[group][trip]),
            [kind]: value,
          },
        },
      },
    }));
  }

  function updateLorryRate(key: string, field: string, value: string | number | null) {
    setLorryRates((current) => {
      const row = current[key] ?? emptyLorryRates["7ft"];

      // Handle nested window fields like "windows.0.rate"
      if (field.startsWith("windows.")) {
        const parts = field.split(".");
        const windowIdx = parseInt(parts[1], 10);
        const windowField = parts[2];
        const windows = [...row.windows];

        if (windows[windowIdx]) {
          if (windowField === "toKm") {
            windows[windowIdx] = {
              ...windows[windowIdx],
              [windowField]: value === null || value === "" ? null : Number(value),
            };
          } else {
            windows[windowIdx] = {
              ...windows[windowIdx],
              [windowField]: value === null || value === "" ? undefined : Number(value),
            };
          }
        }

        return {
          ...current,
          [key]: { ...row, windows },
        };
      }

      // Handle regular fields
      return {
        ...current,
        [key]: {
          ...row,
          [field]: field === "type" ? String(value) : Number(value),
        },
      };
    });
  }

  function updateAllLorryRates(field: string, value: number) {
    setLorryRates((current) => Object.fromEntries(
      Object.entries(current).map(([key, row]) => [key, { ...row, [field]: value }]),
    ) as LorryRates);
  }

  function InvoicePreview({ form }: { form: QuotationForm }) {
    const chargeRows: Array<{ label: string; amount: string }> = [
      { label: `For First ${form.firstKms || "—"} Kms`, amount: form.amount },
      { label: `Extra Additional ${form.extraKms || "—"} Kms`, amount: "" },
      ...(form.packageHours ? [{ label: `${form.packageHours} Hrs Package With ${form.packageWith || "—"}`, amount: "" }] : []),
      ...(form.extraHours ? [{ label: `Extra Additional ${form.extraHours} Hrs`, amount: "" }] : []),
      ...(form.loadingCharges ? [{ label: "Loading Charges", amount: form.loadingCharges }] : []),
      ...(form.pickupCharges ? [{ label: "Pickup Charges", amount: form.pickupCharges }] : []),
    ];

    return (
      <div className="border border-border rounded-lg p-6 bg-charcoal h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="mb-4 pb-3 border-b border-white/20">
            <h3 className="text-base font-bold text-white">{form.documentType}</h3>
            <p className="text-xs text-white/70">Date: {form.date || "—"} | Vehicle: {form.vehicleNo || "—"} | Cab: {form.cabNo || "—"}</p>
          </div>

          <div className="space-y-2 text-xs mb-4">
            <div><span className="text-white/60">Customer:</span> <span className="text-white font-semibold">{form.customerName || "—"}</span></div>
            <div><span className="text-white/60">Description:</span> <span className="text-white">{form.description || form.vehicle || "—"}</span></div>
            <div><span className="text-white/60">No. Of Kms:</span> <span className="text-white font-semibold">{form.noOfKms || form.days || "—"}</span></div>
            {form.meterReadingStart && <div><span className="text-white/60">Meter Start:</span> <span className="text-white">{form.meterReadingStart}</span></div>}
            {form.meterReadingEnd && <div><span className="text-white/60">Meter End:</span> <span className="text-white">{form.meterReadingEnd}</span></div>}
          </div>

          <div className="border border-white/20 rounded mb-4 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-charcoal/80 border-b border-white/20">
                  <th className="px-2 py-2 text-left text-white">Description</th>
                  <th className="px-2 py-2 text-right text-white">Rate</th>
                  <th className="px-2 py-2 text-right text-white">Amount</th>
                </tr>
              </thead>
              <tbody>
                {chargeRows.map((row, i) => (
                  <tr key={i} className="border-t border-white/10">
                    <td className="px-2 py-2 text-white">{row.label}</td>
                    <td className="px-2 py-2 text-right text-white">{form.rate ? `Rs. ${form.rate}` : "—"}</td>
                    <td className="px-2 py-2 text-right text-white font-semibold">{row.amount ? `Rs. ${row.amount}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-gold">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-semibold">TOTAL AMOUNT</span>
            <span className="text-lg font-bold text-gold">{form.amount ? `Rs. ${form.amount}` : "—"}</span>
          </div>
          {form.notes && <p className="text-xs text-white/70 italic">{form.notes}</p>}
        </div>
      </div>
    );
  }

  function addLorryWindow(key: string) {
    setLorryRates((current) => {
      const row = current[key];
      if (!row) return current;

      const lastWindow = row.windows[row.windows.length - 1];
      const nextFromKm = (lastWindow?.toKm ?? 130) + 1;

      return {
        ...current,
        [key]: {
          ...row,
          windows: [
            ...row.windows,
            { fromKm: nextFromKm, toKm: null, rate: 0, extraPerKm: 0 }
          ],
        },
      };
    });
  }

  function removeLorryWindow(key: string, idx: number) {
    setLorryRates((current) => {
      const row = current[key];
      if (!row || row.windows.length <= 1) return current;

      return {
        ...current,
        [key]: {
          ...row,
          windows: row.windows.filter((_, i) => i !== idx),
        },
      };
    });
  }

  function updateLorryImageForm(key: ImageSlot, value: string | undefined) {
    setLorryImageForm((current) => ({ ...current, [key]: value }));
  }

  async function saveLorryImages(imageData: LorryImageForm) {
    if (!currentLorry || !currentLorry.id) return;
    setSavingLorryImages(true);
    try {
      const payload: VehicleFormInput = {
        ...currentLorry,
        ...imageData,
      };
      await saveLorryToDatabase(payload, currentLorry.id);
      alert("Lorry images saved successfully!");
      void refreshVehicles();
    } catch (e) {
      console.error("Save error:", e);
      alert("Failed to save lorry images");
    } finally {
      setSavingLorryImages(false);
    }
  }

  async function saveLorryRates() {
    setSavingLorryRates(true);
    setLorrySaveStatus("Saving all lorries...");
    try {
      // Save all lorries
      for (const [lorryName, rates] of allLorryRates.entries()) {
        const lorry = adminVehicles.find(v => v.name === lorryName);
        if (!lorry) continue;

        const lorryVehicle: VehicleFormInput = {
          ...lorry,
          lorryRates: rates,
        };
        await saveLorryToDatabase(lorryVehicle, lorry.id);
      }
      await refreshVehicles();
      setLorrySaveStatus("All lorries saved ✓");
      setIsLorryEditing(false);
    } catch (e) {
      console.error("Save error:", e);
      setLorrySaveStatus("Error saving lorries");
      setIsLorryEditing(false);
    } finally {
      setSavingLorryRates(false);
    }
  }

  async function saveVehicleChanges() {
    if (!editingVehicle.name.trim()) return;
    setVehicleSaving(true);
    setVehicleSaveError("");
    try {
      const existingVehicle = adminVehicles.find((v) => v.name === editingVehicleName);
      await saveVehicleToDatabase(editingVehicle, existingVehicle?.id);
      await refreshVehicles();
      closeVehicleDialog();
    } catch (error) {
      setVehicleSaveError(error instanceof Error ? error.message : "Could not save vehicle.");
    } finally {
      setVehicleSaving(false);
    }
  }

  async function onVehicleImageUpload(file: File | undefined, target: "img" | "img2") {
    if (!file || !file.type.startsWith("image/")) return;
    setImageUploading(target);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch(`${API_BASE}/vehicles/image`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      if (!response.ok) throw new Error("Image upload failed");
      const payload = await response.json() as { url: string };
      const fullUrl = API_BASE.replace(/\/api$/, "") + payload.url;
      updateVehicleForm(target, fullUrl);
    } catch {
      // fallback: embed as base64 if upload fails
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") updateVehicleForm(target, reader.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setImageUploading(null);
    }
  }

  async function onLorryImageUpload(file: File | undefined, target: ImageSlot) {
    if (!file || !file.type.startsWith("image/")) return;
    setLorryImageUploading(target);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch(`${API_BASE}/vehicles/image`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      if (!response.ok) throw new Error("Image upload failed");
      const payload = await response.json() as { url: string };
      const fullUrl = API_BASE.replace(/\/api$/, "") + payload.url;
      updateLorryImageForm(target, fullUrl);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") updateLorryImageForm(target, reader.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setLorryImageUploading(null);
    }
  }

  async function onVehicleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!vehicleForm.name.trim()) return;
    const editingVehicle = adminVehicles.find((vehicle) => vehicle.name === editingVehicleName);
    setVehicleSaving(true);
    try {
      await saveVehicleToDatabase(vehicleForm, editingVehicle?.id);
    } catch (error) {
      setVehicleSaveError(error instanceof Error ? error.message : "Could not save vehicle.");
      return;
    } finally {
      setVehicleSaving(false);
    }
    await refreshVehicles();
    closeVehicleDialog();
  }

  async function onCategorySubmit(event: FormEvent) {
    event.preventDefault();
    const category = newCategory.trim();
    if (!category) return;
    setSavingCategory(true);
    try {
      await saveCategoryToDatabase(category);
    } catch {
      saveCustomCategory(category);
    } finally {
      setSavingCategory(false);
      setNewCategory("");
      setVehicleForm((current) => ({ ...current, category }));
      await refreshVehicles();
    }
  }

  function editVehicle(vehicle: VehicleCatalogItem) {
    setEditingVehicleName(vehicle.name);
    const vehicleData = {
      name: vehicle.name,
      category: vehicle.category,
      img: vehicle.img,
      img2: vehicle.img2,
      seats: vehicle.seats,
      acPricePerKm: vehicle.acPricePerKm,
      acHillPricePerKm: vehicle.acHillPricePerKm,
      nonAcPricePerKm: vehicle.nonAcPricePerKm,
      nonAcHillPricePerKm: vehicle.nonAcHillPricePerKm,
      perKmPrices: vehicle.perKmPrices ?? { ...emptyPerKmPrices },
      acAvailable: vehicle.acAvailable,
      nonAcAvailable: vehicle.nonAcAvailable,
      package1Prices: vehicle.package1Prices ?? { ...emptyPackagePrices },
      lorryRates: vehicle.lorryRates ?? { ...emptyLorryRates },
      vehicleCostPerDay: vehicle.vehicleCostPerDay ?? 0,
      driverChargePerDay: vehicle.driverChargePerDay ?? 0,
      fuelPricePerLiter: vehicle.fuelPricePerLiter ?? 0,
      normalKmPerLiter: vehicle.normalKmPerLiter ?? 0,
      hillKmPerLiter: vehicle.hillKmPerLiter ?? 0,
      includeOperatingCosts: vehicle.includeOperatingCosts ?? false,
      commissionRate: vehicle.commissionRate ?? 0,
    };
    setVehicleForm(vehicleData);
    setEditingVehicle(vehicleData);
    setIsVehicleDialogOpen(true);
  }

  function resetVehicleForm() {
    setVehicleForm(emptyVehicleForm);
    setEditingVehicle(emptyVehicleForm);
    setEditingVehicleName(null);
    setVehicleSaveError("");
  }

  function openAddVehicleDialog() {
    resetVehicleForm();
    setIsVehicleDialogOpen(true);
  }

  function closeVehicleDialog() {
    resetVehicleForm();
    setIsVehicleDialogOpen(false);
  }

  async function onLogout() {
    await adminLogout();
    navigate("/admin/login");
  }

  async function exportJson() {
    let vehicles = adminVehicles;
    let lorries = adminVehicles.filter((vehicle) => vehicle.category.toLowerCase().includes("lorry"));

    try {
      const [vehicleData, lorryData] = await Promise.all([getVehiclesFromDatabase(), getLorriesFromDatabase()]);
      vehicles = vehicleData;
      lorries = lorryData;
    } catch {
      // fall back to the already loaded in-memory data
    }

    const payload = {
      exportedAt: new Date().toISOString(),
      company: {
        name: "Agra Taxis",
        phone: PHONE,
        phoneDisplay: PHONE_DISPLAY,
        whatsapp: WHATSAPP,
        email: EMAIL,
      },
      lorries,
      vehicles,
    };
    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agra-taxis-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const seatOptions = useMemo(() => {
    return Array.from(new Set(adminVehicles.map((vehicle) => vehicle.seats))).sort((a, b) => a - b);
  }, [adminVehicles]);

  const filteredVehicles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return adminVehicles.filter((vehicle) => {
      if (vehicle.category.toLowerCase().includes("lorry")) return false;
      if (q && ![vehicle.name, vehicle.category].some((value) => value.toLowerCase().includes(q))) {
        return false;
      }
      if (categoryFilter !== "All" && vehicle.category !== categoryFilter) return false;
      if (seatFilter !== "all" && vehicle.seats !== Number(seatFilter)) return false;
      if (comfortFilter === "ac" && !vehicle.acAvailable) return false;
      if (comfortFilter === "nonAc" && !vehicle.nonAcAvailable) return false;
      return true;
    });
  }, [adminVehicles, categoryFilter, comfortFilter, search, seatFilter]);

  const filteredLorries = useMemo(() => {
    const q = search.trim().toLowerCase();
    return adminVehicles.filter((vehicle) => {
      if (!vehicle.category.toLowerCase().includes("lorry")) return false;
      if (q && ![vehicle.name, vehicle.category].some((value) => value.toLowerCase().includes(q))) {
        return false;
      }
      if (seatFilter !== "all" && vehicle.seats !== Number(seatFilter)) return false;
      if (comfortFilter === "ac" && !vehicle.acAvailable) return false;
      if (comfortFilter === "nonAc" && !vehicle.nonAcAvailable) return false;
      return true;
    });
  }, [adminVehicles, comfortFilter, search, seatFilter]);

  const passengerVehicleCount = adminVehicles.filter((vehicle) => !vehicle.category.toLowerCase().includes("lorry")).length;
  const lorryCount = adminVehicles.filter((vehicle) => vehicle.category.toLowerCase().includes("lorry")).length;
  const visibleFleetItems = filteredVehicles;
  const isFleetTab = activeTab === "vehicles";

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      {/* Premium header */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-charcoal text-white shadow-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gold/20 blur-sm opacity-0 transition-opacity group-hover:opacity-100" />
              <img src={logo} alt="Agra Taxis" className="relative h-9 w-9 rounded-full object-cover ring-1 ring-gold/30" />
            </div>
            <div>
              <div className="font-display text-sm font-bold leading-tight tracking-tight">Agra Taxis</div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-gold/70">Admin Dashboard</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void exportJson()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gold/25 bg-gold/8 px-3 py-1.5 text-xs font-semibold text-gold/90 transition-all hover:border-gold/40 hover:bg-gold/15"
            >
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/4 px-3 py-1.5 text-xs font-semibold text-white/70 transition-all hover:border-white/15 hover:bg-white/8 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-charcoal">Admin Panel</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Manage vehicles, lorries, categories and pricing.</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-border bg-white p-2 shadow-soft">
          {[
            { id: "vehicles" as const, label: "Vehicles" },
            { id: "lorries" as const, label: "Lorries" },
            { id: "invoices" as const, label: "Invoices / Quotations" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "bg-charcoal text-white"
                  : "text-muted-foreground hover:bg-[#f0f2f5] hover:text-charcoal"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats row */}
        {isFleetTab && <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Vehicles", value: passengerVehicleCount, accent: false },
            { label: "Total Lorries", value: lorryCount, accent: false },
            { label: "Categories", value: categoryOptions.filter(c => c !== "All").length, accent: false },
            { label: "Filtered Results", value: visibleFleetItems.length, accent: true },
          ].map(({ label, value, accent }) => (
            <div key={label} className={`rounded-xl border px-4 py-3.5 ${accent ? "border-gold/20 bg-gold/5" : "border-border bg-white shadow-soft"}`}>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className={`mt-1 text-3xl font-bold ${accent ? "text-gold" : "text-charcoal"}`}>{value}</p>
            </div>
          ))}
        </div>}

        {isFleetTab && <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
          {/* Section toolbar */}
          <div className="flex flex-col gap-3 border-b border-border bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-charcoal">{activeTab === "lorries" ? "Lorries" : "Vehicles"}</h2>
              <p className="text-xs text-muted-foreground">
                {activeTab === "lorries"
                  ? `${lorryCount} lorries available for lorry bookings`
                  : `${passengerVehicleCount} vehicles across ${categoryOptions.filter(c => c !== "All").length} categories`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void refreshVehicles()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-[#f4f5f7] px-3 py-2 text-sm font-semibold text-charcoal hover:bg-accent transition-colors"
              >
                <RotateCw className="h-3.5 w-3.5" /> Refresh
              </button>
              <form onSubmit={onCategorySubmit} className="flex gap-2">
                <input
                  value={newCategory}
                  onChange={(event) => setNewCategory(event.target.value)}
                  placeholder="New category..."
                  disabled={savingCategory}
                  className="w-36 rounded-lg border border-border bg-[#f0f2f5] px-3 py-2 text-sm text-charcoal outline-none transition-all focus:border-gold/40 focus:ring-1 focus:ring-gold/20 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-[#f4f5f7] px-3 py-2 text-sm font-semibold text-charcoal hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {savingCategory ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" /> Category
                    </>
                  )}
                </button>
              </form>
              <button
                type="button"
                onClick={() => {
                  resetVehicleForm();
                  if (activeTab === "lorries") {
                    setVehicleForm((current) => ({ ...current, category: "Lorries" }));
                  }
                  setIsVehicleDialogOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-charcoal px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                <Plus className="h-3.5 w-3.5" /> {activeTab === "lorries" ? "Add Lorry" : "Add Vehicle"}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid gap-2 border-b border-border bg-[#f8f9fb] px-5 py-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              <input
                key="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search vehicles..."
                className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-charcoal outline-none transition-all focus:border-gold/40 focus:ring-1 focus:ring-gold/20"
              />,
              <select key="cat" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-charcoal outline-none transition-all focus:border-gold/40 focus:ring-1 focus:ring-gold/20">
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>{category === "All" ? "All categories" : category}</option>
                ))}
              </select>,
              <select key="seats" value={seatFilter} onChange={(event) => setSeatFilter(event.target.value)} className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-charcoal outline-none transition-all focus:border-gold/40 focus:ring-1 focus:ring-gold/20">
                <option value="all">All seats</option>
                {seatOptions.map((seats) => <option key={seats} value={seats}>{seats} seats</option>)}
              </select>,
              <select key="comfort" value={comfortFilter} onChange={(event) => setComfortFilter(event.target.value as typeof comfortFilter)} className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-charcoal outline-none transition-all focus:border-gold/40 focus:ring-1 focus:ring-gold/20">
                <option value="all">All comfort</option>
                <option value="ac">AC only</option>
                <option value="nonAc">Non-AC only</option>
              </select>,
            ]}
          </div>

          {/* Vehicle grid */}
          <div className="p-5">
            {loadingVehicles && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="mb-3 h-8 w-8 animate-spin text-charcoal" />
                <p className="text-sm font-medium text-muted-foreground">Loading vehicles...</p>
              </div>
            )}
            {!loadingVehicles && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleFleetItems.map((vehicle) => (
                <div key={vehicle.name} className="group overflow-hidden rounded-2xl border border-border bg-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card">
                  <div className="relative h-44 overflow-hidden bg-secondary">
                    <img src={vehicle.img} alt={vehicle.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute top-2.5 right-2.5 flex gap-1">
                      {vehicle.acAvailable && <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-charcoal shadow-sm">AC</span>}
                      {vehicle.nonAcAvailable && <span className="rounded-full border border-white/30 bg-white/15 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">NON-AC</span>}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="truncate text-sm font-bold leading-tight text-white drop-shadow-sm">{vehicle.name}</p>
                      <p className="mt-0.5 text-[11px] text-white/65">{vehicle.category} · {vehicle.seats} seats</p>
                    </div>
                  </div>
                  <div className="p-3.5">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-[#f8f9fb] px-2.5 py-2">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">AC / km</p>
                        <p className="text-[10px] text-muted-foreground">Normal charge</p>
                        <p className="text-[10px] text-muted-foreground">Hill {vehicle.acAvailable ? formatLkr(vehicle.acHillPricePerKm) : "N/A"}</p>
                        <p className="mt-0.5 font-bold text-charcoal">{vehicle.acAvailable ? formatLkr(vehicle.acPricePerKm) : "—"}</p>
                      </div>
                      <div className="rounded-lg bg-[#f8f9fb] px-2.5 py-2">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Non-AC / km</p>
                        <p className="text-[10px] text-muted-foreground">Normal charge</p>
                        <p className="text-[10px] text-muted-foreground">Hill {vehicle.nonAcAvailable ? formatLkr(vehicle.nonAcHillPricePerKm) : "N/A"}</p>
                        <p className="mt-0.5 font-bold text-charcoal">{vehicle.nonAcAvailable ? formatLkr(vehicle.nonAcPricePerKm) : "—"}</p>
                      </div>
                    </div>
                    <div className="mt-2 rounded-lg border border-border bg-[#f8f9fb] px-2.5 py-2">
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Packages</p>
                      <p className="text-[10px] text-charcoal">Package 1: up to 150 km/day</p>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => editVehicle(vehicle)}
                        className="rounded-lg border border-border bg-white py-2 text-xs font-semibold text-charcoal transition-all hover:border-charcoal/20 hover:bg-charcoal hover:text-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setVehicleToDelete(vehicle)}
                        className="rounded-lg border border-red-100 bg-red-50/50 py-2 text-xs font-semibold text-red-500 transition-all hover:border-red-200 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}

            {!loadingVehicles && visibleFleetItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 rounded-full border border-border bg-[#f8f9fb] p-5">
                  <Car className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="font-semibold text-charcoal">No {activeTab === "lorries" ? "lorries" : "vehicles"} found</p>
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or add a new {activeTab === "lorries" ? "lorry" : "vehicle"}.</p>
                <button
                  onClick={() => {
                    resetVehicleForm();
                    if (activeTab === "lorries") setVehicleForm((current) => ({ ...current, category: "Lorries" }));
                    setIsVehicleDialogOpen(true);
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-charcoal px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  <Plus className="h-3.5 w-3.5" /> Add {activeTab === "lorries" ? "Lorry" : "Vehicle"}
                </button>
              </div>
            )}
          </div>
        </section>}

        {activeTab === "lorries" && (
          <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
            <div className="border-b border-border px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-bold text-charcoal">Lorry Rates</h2>
                  <p className="text-xs text-muted-foreground">All 9 lorries with 5 fare components: base, extra km, hill, up/down, and waiting. Multiple distance windows per type.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void refreshVehicles()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-[#f4f5f7] px-3 py-2 text-sm font-semibold text-charcoal hover:bg-accent transition-colors"
                  >
                    <RotateCw className="h-3.5 w-3.5" /> Refresh
                  </button>
                  {!isLorryEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsLorryEditing(true);
                        setLorrySaveStatus("");
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-charcoal px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="overflow-x-auto border border-border">
                <table className="w-full text-left text-sm bg-white">
                  <thead className="bg-charcoal text-[10px] uppercase tracking-wider text-white">
                    <tr>
                      <th className="px-4 py-2 font-semibold">Lorry Type</th>
                      <th className="px-4 py-2 font-semibold">From KM</th>
                      <th className="px-4 py-2 font-semibold">To KM</th>
                      <th className="px-4 py-2 font-semibold">Rate</th>
                      <th className="px-4 py-2 font-semibold">Extra/KM</th>
                      <th className="px-4 py-2 font-semibold">Hill Extra/KM</th>
                      <th className="px-4 py-2 font-semibold">UpDown (Normal)</th>
                      <th className="px-4 py-2 font-semibold">UpDown (Hill)</th>
                      <th className="px-4 py-2 font-semibold">Free Wait (h)</th>
                      <th className="px-4 py-2 font-semibold">Wait/Hour</th>
                      <th className="px-4 py-2 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(allLorryRates.entries()).flatMap(([lorryName, rates]) => {
                      // Iterate through ALL lorry types in the consolidated JSON
                      return Object.entries(rates).flatMap(([rateKey, rateData]) => {
                        if (!rateData) return [];

                        const windows = rateData.windows || [];

                        if (windows.length === 0) {
                          return (
                            <tr key={`${lorryName}-${rateKey}`} className="border-t border-border hover:bg-gray-50">
                              <td className="px-4 py-2 font-semibold text-charcoal">{rateData.type || rateKey}</td>
                              <td colSpan={9} className="px-4 py-2 text-center text-charcoal/50">No distance windows configured</td>
                            </tr>
                          );
                        }

                        return windows.map((window, windowIdx) => (
                        <tr key={`${rateKey}-${windowIdx}`} className="border-t border-border hover:bg-gray-50">
                                {windowIdx === 0 && (
                                  <td rowSpan={windows.length} className="px-4 py-2 font-semibold text-charcoal">{rateData.type || rateKey}</td>
                                )}
                                <td className="px-4 py-2 text-charcoal">
                                  {isLorryEditing ? (
                                    <input
                                      type="number"
                                      value={window.fromKm || 0}
                                      onChange={(e) => {
                                        const updated = new Map(allLorryRates);
                                        const rate = updated.get(lorryName);
                                        if (rate && rate[rateKey]) {
                                          rate[rateKey].windows[windowIdx].fromKm = Number(e.target.value);
                                        }
                                        setAllLorryRates(updated);
                                      }}
                                      className="w-20 rounded border border-border bg-white px-2 py-1 text-charcoal outline-none"
                                    />
                                  ) : (
                                    window.fromKm || 0
                                  )}
                                </td>
                                <td className="px-4 py-2 text-charcoal">
                                  {isLorryEditing ? (
                                    <input
                                      type="number"
                                      value={window.toKm || 130}
                                      onChange={(e) => {
                                        const updated = new Map(allLorryRates);
                                        const rate = updated.get(lorryName);
                                        if (rate && rate[rateKey]) {
                                          rate[rateKey].windows[windowIdx].toKm = e.target.value ? Number(e.target.value) : null;
                                        }
                                        setAllLorryRates(updated);
                                      }}
                                      className="w-20 rounded border border-border bg-white px-2 py-1 text-charcoal outline-none"
                                    />
                                  ) : (
                                    window.toKm || 130
                                  )}
                                </td>
                                <td className="px-4 py-2 text-charcoal">
                                  {isLorryEditing ? (
                                    <input
                                      type="number"
                                      value={window.rate || 0}
                                      onChange={(e) => {
                                        const updated = new Map(allLorryRates);
                                        const rate = updated.get(lorryName);
                                        if (rate && rate[rateKey]) {
                                          rate[rateKey].windows[windowIdx].rate = Number(e.target.value);
                                        }
                                        setAllLorryRates(updated);
                                      }}
                                      className="w-20 rounded border border-border bg-white px-2 py-1 text-charcoal outline-none"
                                    />
                                  ) : (
                                    window.rate || 0
                                  )}
                                </td>
                                <td className="px-4 py-2 text-charcoal">
                                  {isLorryEditing ? (
                                    <input
                                      type="number"
                                      value={window.extraPerKm || 0}
                                      onChange={(e) => {
                                        const updated = new Map(allLorryRates);
                                        const rate = updated.get(lorryName);
                                        if (rate && rate[rateKey]) {
                                          rate[rateKey].windows[windowIdx].extraPerKm = Number(e.target.value);
                                        }
                                        setAllLorryRates(updated);
                                      }}
                                      className="w-20 rounded border border-border bg-white px-2 py-1 text-charcoal outline-none"
                                    />
                                  ) : (
                                    window.extraPerKm || 0
                                  )}
                                </td>
                                <td className="px-4 py-2 text-charcoal">
                                  {isLorryEditing ? (
                                    <input
                                      type="number"
                                      value={window.hillExtraPerKm || 0}
                                      onChange={(e) => {
                                        const updated = new Map(allLorryRates);
                                        const rate = updated.get(lorryName);
                                        if (rate && rate[rateKey]) {
                                          rate[rateKey].windows[windowIdx].hillExtraPerKm = Number(e.target.value);
                                        }
                                        setAllLorryRates(updated);
                                      }}
                                      className="w-20 rounded border border-border bg-white px-2 py-1 text-charcoal outline-none"
                                    />
                                  ) : (
                                    window.hillExtraPerKm || 0
                                  )}
                                </td>
                                <td className="px-4 py-2 text-charcoal">
                                  {isLorryEditing ? (
                                    <input
                                      type="number"
                                      value={rateData.upDownNonHill || 0}
                                      onChange={(e) => {
                                        const updated = new Map(allLorryRates);
                                        const rate = updated.get(lorryName);
                                        if (rate && rate[rateKey]) {
                                          rate[rateKey].upDownNonHill = Number(e.target.value);
                                        }
                                        setAllLorryRates(updated);
                                      }}
                                      className="w-20 rounded border border-border bg-white px-2 py-1 text-charcoal outline-none"
                                    />
                                  ) : (
                                    rateData.upDownNonHill || 0
                                  )}
                                </td>
                                <td className="px-4 py-2 text-charcoal">
                                  {isLorryEditing ? (
                                    <input
                                      type="number"
                                      value={rateData.upDownHill || 0}
                                      onChange={(e) => {
                                        const updated = new Map(allLorryRates);
                                        const rate = updated.get(lorryName);
                                        if (rate && rate[rateKey]) {
                                          rate[rateKey].upDownHill = Number(e.target.value);
                                        }
                                        setAllLorryRates(updated);
                                      }}
                                      className="w-20 rounded border border-border bg-white px-2 py-1 text-charcoal outline-none"
                                    />
                                  ) : (
                                    rateData.upDownHill || 0
                                  )}
                                </td>
                                <td className="px-4 py-2 text-charcoal">
                                  {isLorryEditing ? (
                                    <input
                                      type="number"
                                      value={rateData.freeWaitingHours || 0}
                                      onChange={(e) => {
                                        const updated = new Map(allLorryRates);
                                        const rate = updated.get(lorryName);
                                        if (rate && rate[rateKey]) {
                                          rate[rateKey].freeWaitingHours = Number(e.target.value);
                                        }
                                        setAllLorryRates(updated);
                                      }}
                                      className="w-20 rounded border border-border bg-white px-2 py-1 text-charcoal outline-none"
                                    />
                                  ) : (
                                    rateData.freeWaitingHours || 0
                                  )}
                                </td>
                                <td className="px-4 py-2 text-charcoal">
                                  {isLorryEditing ? (
                                    <input
                                      type="number"
                                      value={rateData.waitingChargePerHour || 0}
                                      onChange={(e) => {
                                        const updated = new Map(allLorryRates);
                                        const rate = updated.get(lorryName);
                                        if (rate && rate[rateKey]) {
                                          rate[rateKey].waitingChargePerHour = Number(e.target.value);
                                        }
                                        setAllLorryRates(updated);
                                      }}
                                      className="w-20 rounded border border-border bg-white px-2 py-1 text-charcoal outline-none"
                                    />
                                  ) : (
                                    rateData.waitingChargePerHour || 0
                                  )}
                                </td>
                                <td className="px-4 py-2 text-charcoal">
                                  {isLorryEditing && (
                                    <div className="flex gap-2">
                                      {windowIdx === windows.length - 1 && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = new Map(allLorryRates);
                                            const rate = updated.get(lorryName);
                                            if (rate && rate[rateKey]) {
                                              if (!rate[rateKey].windows) rate[rateKey].windows = [];
                                              rate[rateKey].windows.push({ fromKm: 0, toKm: 130, rate: 0, extraPerKm: 0, hillExtraPerKm: 0 });
                                            }
                                            setAllLorryRates(updated);
                                          }}
                                          className="text-xs rounded bg-charcoal text-white px-2 py-1 hover:opacity-90"
                                        >
                                          Add
                                        </button>
                                      )}
                                      {windows.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = new Map(allLorryRates);
                                            const rate = updated.get(lorryName);
                                            if (rate && rate[rateKey]) {
                                              rate[rateKey].windows?.splice(windowIdx, 1);
                                            }
                                            setAllLorryRates(updated);
                                          }}
                                          className="text-xs rounded bg-red-600 text-white px-2 py-1 hover:opacity-90"
                                        >
                                          Remove
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ));
                      });
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center justify-end gap-3">
                {lorrySaveStatus && <p className="text-xs font-medium text-muted-foreground">{lorrySaveStatus}</p>}
                {isLorryEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsLorryEditing(false);
                      setLorrySaveStatus("");
                      void refreshVehicles();
                    }}
                    className="rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-charcoal hover:bg-accent"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  disabled={!isLorryEditing || savingLorryRates}
                  onClick={() => void saveLorryRates()}
                  className="rounded-xl bg-charcoal px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 transition-opacity inline-flex items-center gap-2"
                >
                  {savingLorryRates ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Lorry Rates"
                  )}
                </button>
              </div>
            </div>

            {/* Lorry Images Section */}
            <div className="border-t border-border px-5 py-6">
              <h3 className="mb-4 text-base font-bold text-charcoal">Lorry Images</h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                {(Object.keys(lorryImageForm) as ImageSlot[]).map((key) => (
                  <div key={key} className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-charcoal uppercase">{key}</label>
                    <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-border bg-gray-50 h-32 flex items-center justify-center group">
                      {lorryImageForm[key] && (
                        <>
                          <img src={lorryImageForm[key]} alt={key} className="h-32 w-full object-cover absolute inset-0" />
                          <button
                            type="button"
                            onClick={() => updateLorryImageForm(key, key === "img" ? "/assets/car.jpg" : undefined)}
                            className="absolute top-1 right-1 z-20 rounded-full bg-red-500 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                            title="Delete image"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {!lorryImageForm[key] && (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => onLorryImageUpload(e.target.files?.[0], key)}
                          className="relative z-10 cursor-pointer px-4 py-2 text-sm"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!currentLorry) return;
                  const imageData = {
                    img: lorryImageForm.img,
                    img2: lorryImageForm.img2,
                    img3: lorryImageForm.img3,
                    img4: lorryImageForm.img4,
                    img5: lorryImageForm.img5,
                  };
                  void saveLorryImages(imageData);
                }}
                disabled={savingLorryImages}
                className="mt-4 rounded-xl bg-charcoal px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity inline-flex items-center gap-2"
              >
                {savingLorryImages ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Lorry Images"
                )}
              </button>
            </div>
          </section>
        )}

        {activeTab === "invoices" && (
          <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
            <div className="border-b border-border px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-bold text-charcoal">Invoices / Quotations</h2>
                  <p className="text-xs text-muted-foreground">Fill the blanks and download a printable PDF. Nothing is saved.</p>
                </div>
                <button
                  type="button"
                  onClick={() => void refreshVehicles()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-[#f4f5f7] px-3 py-2 text-sm font-semibold text-charcoal hover:bg-accent transition-colors"
                >
                  <RotateCw className="h-3.5 w-3.5" /> Refresh
                </button>
              </div>
            </div>
            <div className="grid gap-6 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)] lg:p-6">
              <form onSubmit={onQuotationSubmit} className="grid gap-5 sm:grid-cols-2">
                <AdminField label="Document Type"><select value={quotationForm.documentType} onChange={(event) => updateQuotationForm("documentType", event.target.value as QuotationForm["documentType"])} className={adminInputClass}><option value="Quotation">Quotation</option><option value="Invoice">Invoice</option></select></AdminField>
                <AdminField label="Date"><input value={quotationForm.date} onChange={(event) => updateQuotationForm("date", event.target.value)} className={adminInputClass} /></AdminField>
                <AdminField label="Vehicle No"><input value={quotationForm.vehicleNo} onChange={(event) => updateQuotationForm("vehicleNo", event.target.value)} className={adminInputClass} /></AdminField>
                <AdminField label="Cab No"><input value={quotationForm.cabNo} onChange={(event) => updateQuotationForm("cabNo", event.target.value)} className={adminInputClass} /></AdminField>
                <AdminField label="TEL"><input value={quotationForm.tel} onChange={(event) => updateQuotationForm("tel", event.target.value)} className={adminInputClass} /></AdminField>
                <AdminField label="Customer Name"><input required value={quotationForm.customerName} onChange={(event) => updateQuotationForm("customerName", event.target.value)} className={adminInputClass} /></AdminField>
                <AdminField label="Vehicle"><input required value={quotationForm.vehicle} onChange={(event) => updateQuotationForm("vehicle", event.target.value)} className={adminInputClass} /></AdminField>
                <AdminField label="Description"><input value={quotationForm.description} onChange={(event) => updateQuotationForm("description", event.target.value)} className={adminInputClass} /></AdminField>
                <AdminField label="Pickup"><input required value={quotationForm.pickup} onChange={(event) => updateQuotationForm("pickup", event.target.value)} className={adminInputClass} /></AdminField>
                <AdminField label="Destination"><input required value={quotationForm.destination} onChange={(event) => updateQuotationForm("destination", event.target.value)} className={adminInputClass} /></AdminField>
                <AdminField label="Days"><input type="number" min={1} value={quotationForm.days} onChange={(event) => updateQuotationForm("days", event.target.value)} className={adminInputClass} /></AdminField>
                <AdminField label="No. Of Kms"><input value={quotationForm.noOfKms} onChange={(event) => updateQuotationForm("noOfKms", event.target.value)} className={adminInputClass} /></AdminField>
                <AdminField label="Meter Reading Start"><input value={quotationForm.meterReadingStart} onChange={(event) => updateQuotationForm("meterReadingStart", event.target.value)} className={adminInputClass} /></AdminField>
                <AdminField label="Meter Reading End"><input value={quotationForm.meterReadingEnd} onChange={(event) => updateQuotationForm("meterReadingEnd", event.target.value)} className={adminInputClass} /></AdminField>
                <AdminField label="Rate"><input value={quotationForm.rate} onChange={(event) => updateQuotationForm("rate", event.target.value)} className={adminInputClass} /></AdminField>
                <AdminField label="First Kms"><input value={quotationForm.firstKms} onChange={(event) => updateQuotationForm("firstKms", event.target.value)} className={adminInputClass} /></AdminField>
                <AdminField label="Extra Kms"><input value={quotationForm.extraKms} onChange={(event) => updateQuotationForm("extraKms", event.target.value)} className={adminInputClass} /></AdminField>
                <AdminField label="Package Hours"><input value={quotationForm.packageHours} onChange={(event) => updateQuotationForm("packageHours", event.target.value)} className={adminInputClass} /></AdminField>
                <AdminField label="Package With"><input value={quotationForm.packageWith} onChange={(event) => updateQuotationForm("packageWith", event.target.value)} className={adminInputClass} /></AdminField>
                <AdminField label="Extra Hours"><input value={quotationForm.extraHours} onChange={(event) => updateQuotationForm("extraHours", event.target.value)} className={adminInputClass} /></AdminField>
                <AdminField label="Loading Charges"><input value={quotationForm.loadingCharges} onChange={(event) => updateQuotationForm("loadingCharges", event.target.value)} className={adminInputClass} /></AdminField>
                <AdminField label="Pickup Charges"><input value={quotationForm.pickupCharges} onChange={(event) => updateQuotationForm("pickupCharges", event.target.value)} className={adminInputClass} /></AdminField>
                <AdminField label="Amount (Rs.)"><input required type="number" min={0} value={quotationForm.amount} onChange={(event) => updateQuotationForm("amount", event.target.value)} className={adminInputClass} /></AdminField>
                <AdminField label="Notes" className="sm:col-span-2"><textarea value={quotationForm.notes} onChange={(event) => updateQuotationForm("notes", event.target.value)} className={`${adminInputClass} min-h-28`} /></AdminField>
                <div className="sm:col-span-2 flex justify-end">
                  <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-charcoal px-4 py-3 text-sm font-semibold text-white hover:opacity-90"><Download className="h-4 w-4" /> Download PDF</button>
                </div>
              </form>
              <InvoicePreview form={quotationForm} />
            </div>
          </section>
        )}

        <Dialog
          open={isVehicleDialogOpen}
          onOpenChange={(open) => {
            if (!open) closeVehicleDialog();
            else setIsVehicleDialogOpen(true);
          }}
        >
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl p-0">
            {/* Dialog header */}
            <div className="border-b border-border px-6 py-5">
              <DialogTitle className="text-lg font-bold text-charcoal">
                {editingVehicleName ? "Update Vehicle" : "Add New Vehicle"}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-sm text-muted-foreground"></DialogDescription>
            </div>

            {/* Dialog form */}
            <div className="grid gap-4 overflow-y-auto p-6">
              <AdminField label="Name">
                <input
                  autoFocus
                  value={editingVehicle.name}
                  onChange={(event) => setEditingVehicle({ ...editingVehicle, name: event.target.value })}
                  placeholder="e.g., Agra Taxis Swift"
                  className={adminInputClass}
                />
              </AdminField>
              <AdminField label="Category">
                <select
                  value={editingVehicle.category}
                  onChange={(event) => setEditingVehicle({ ...editingVehicle, category: event.target.value })}
                  className={adminInputClass}
                >
                  <option value="Sedans">Sedans</option>
                  <option value="Lorries">Lorries</option>
                  <option value="Mini Bus">Mini Bus</option>
                </select>
              </AdminField>
              <AdminField label="Seats">
                <input
                  type="number"
                  min={1}
                  value={editingVehicle.seats}
                  onChange={(event) => setEditingVehicle({ ...editingVehicle, seats: Number(event.target.value) || 1 })}
                  className={adminInputClass}
                />
              </AdminField>
              <AdminField label="AC Available">
                <input
                  type="checkbox"
                  checked={editingVehicle.acAvailable}
                  onChange={(event) => setEditingVehicle({ ...editingVehicle, acAvailable: event.target.checked })}
                  className="h-4 w-4 rounded border-border"
                />
              </AdminField>
              <AdminField label="Non-AC Available">
                <input
                  type="checkbox"
                  checked={editingVehicle.nonAcAvailable}
                  onChange={(event) => setEditingVehicle({ ...editingVehicle, nonAcAvailable: event.target.checked })}
                  className="h-4 w-4 rounded border-border"
                />
              </AdminField>
              <div className="border-t pt-4">
                <h4 className="mb-4 font-semibold text-charcoal">Operating Costs</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminField label="Vehicle Cost Per Day">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingVehicle.vehicleCostPerDay ?? 0}
                      onChange={(event) => setEditingVehicle({ ...editingVehicle, vehicleCostPerDay: Number(event.target.value) || 0 })}
                      className={adminInputClass}
                    />
                  </AdminField>
                  <AdminField label="Driver Charge Per Day">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingVehicle.driverChargePerDay ?? 0}
                      onChange={(event) => setEditingVehicle({ ...editingVehicle, driverChargePerDay: Number(event.target.value) || 0 })}
                      className={adminInputClass}
                    />
                  </AdminField>
                  <AdminField label="Fuel Price Per Liter">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingVehicle.fuelPricePerLiter ?? 0}
                      onChange={(event) => setEditingVehicle({ ...editingVehicle, fuelPricePerLiter: Number(event.target.value) || 0 })}
                      className={adminInputClass}
                    />
                  </AdminField>
                  <AdminField label="Normal Km Per Liter">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingVehicle.normalKmPerLiter ?? 0}
                      onChange={(event) => setEditingVehicle({ ...editingVehicle, normalKmPerLiter: Number(event.target.value) || 0 })}
                      className={adminInputClass}
                    />
                  </AdminField>
                  <AdminField label="Hill Km Per Liter">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingVehicle.hillKmPerLiter ?? 0}
                      onChange={(event) => setEditingVehicle({ ...editingVehicle, hillKmPerLiter: Number(event.target.value) || 0 })}
                      className={adminInputClass}
                    />
                  </AdminField>
                  <AdminField label="Commission Rate">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={editingVehicle.commissionRate ?? 0}
                      onChange={(event) => setEditingVehicle({ ...editingVehicle, commissionRate: Number(event.target.value) || 0 })}
                      className={adminInputClass}
                    />
                  </AdminField>
                  <AdminField label="Calculation Logic" className="sm:col-span-2">
                    <label className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-3 text-sm font-semibold text-charcoal">
                      <input
                        type="checkbox"
                        checked={Boolean(editingVehicle.includeOperatingCosts)}
                        onChange={(event) => setEditingVehicle({ ...editingVehicle, includeOperatingCosts: event.target.checked })}
                        className="h-4 w-4 rounded border-border"
                      />
                      With operational cost
                    </label>
                  </AdminField>
                </div>
              </div>
              {editingVehicle.acAvailable && (
              <div className="border-t pt-4">
                <h4 className="mb-4 font-semibold text-charcoal">Pricing - AC (8 Tiers)</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminField label="AC OneWay Normal">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingVehicle.perKmPrices?.ac?.oneWay?.normal ?? 0}
                      onChange={(event) => {
                        const val = Number(event.target.value) || 0;
                        setEditingVehicle(prev => ({
                          ...prev,
                          perKmPrices: { ...prev.perKmPrices, ac: { ...prev.perKmPrices.ac, oneWay: { normal: val, hill: prev.perKmPrices.ac.oneWay.hill } } }
                        }));
                      }}
                      className={adminInputClass}
                    />
                  </AdminField>
                  <AdminField label="AC OneWay Hill">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingVehicle.perKmPrices?.ac?.oneWay?.hill ?? 0}
                      onChange={(event) => {
                        const val = Number(event.target.value) || 0;
                        setEditingVehicle(prev => ({
                          ...prev,
                          perKmPrices: { ...prev.perKmPrices, ac: { ...prev.perKmPrices.ac, oneWay: { normal: prev.perKmPrices.ac.oneWay.normal, hill: val } } }
                        }));
                      }}
                      className={adminInputClass}
                    />
                  </AdminField>
                  <AdminField label="AC RoundTrip Normal">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingVehicle.perKmPrices?.ac?.roundTrip?.normal ?? 0}
                      onChange={(event) => {
                        const val = Number(event.target.value) || 0;
                        setEditingVehicle(prev => ({
                          ...prev,
                          perKmPrices: { ...prev.perKmPrices, ac: { ...prev.perKmPrices.ac, roundTrip: { normal: val, hill: prev.perKmPrices.ac.roundTrip.hill } } }
                        }));
                      }}
                      className={adminInputClass}
                    />
                  </AdminField>
                  <AdminField label="AC RoundTrip Hill">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingVehicle.perKmPrices?.ac?.roundTrip?.hill ?? 0}
                      onChange={(event) => {
                        const val = Number(event.target.value) || 0;
                        setEditingVehicle(prev => ({
                          ...prev,
                          perKmPrices: { ...prev.perKmPrices, ac: { ...prev.perKmPrices.ac, roundTrip: { normal: prev.perKmPrices.ac.roundTrip.normal, hill: val } } }
                        }));
                      }}
                      className={adminInputClass}
                    />
                  </AdminField>
                </div>
              </div>
              )}

              {editingVehicle.nonAcAvailable && (
              <div className="border-t pt-4">
                <h4 className="mb-4 font-semibold text-charcoal">Pricing - Non-AC (8 Tiers)</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminField label="Non-AC OneWay Normal">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingVehicle.perKmPrices?.nonAc?.oneWay?.normal ?? 0}
                      onChange={(event) => {
                        const val = Number(event.target.value) || 0;
                        setEditingVehicle(prev => ({
                          ...prev,
                          perKmPrices: { ...prev.perKmPrices, nonAc: { ...prev.perKmPrices.nonAc, oneWay: { normal: val, hill: prev.perKmPrices.nonAc.oneWay.hill } } }
                        }));
                      }}
                      className={adminInputClass}
                    />
                  </AdminField>
                  <AdminField label="Non-AC OneWay Hill">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingVehicle.perKmPrices?.nonAc?.oneWay?.hill ?? 0}
                      onChange={(event) => {
                        const val = Number(event.target.value) || 0;
                        setEditingVehicle(prev => ({
                          ...prev,
                          perKmPrices: { ...prev.perKmPrices, nonAc: { ...prev.perKmPrices.nonAc, oneWay: { normal: prev.perKmPrices.nonAc.oneWay.normal, hill: val } } }
                        }));
                      }}
                      className={adminInputClass}
                    />
                  </AdminField>
                  <AdminField label="Non-AC RoundTrip Normal">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingVehicle.perKmPrices?.nonAc?.roundTrip?.normal ?? 0}
                      onChange={(event) => {
                        const val = Number(event.target.value) || 0;
                        setEditingVehicle(prev => ({
                          ...prev,
                          perKmPrices: { ...prev.perKmPrices, nonAc: { ...prev.perKmPrices.nonAc, roundTrip: { normal: val, hill: prev.perKmPrices.nonAc.roundTrip.hill } } }
                        }));
                      }}
                      className={adminInputClass}
                    />
                  </AdminField>
                  <AdminField label="Non-AC RoundTrip Hill">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingVehicle.perKmPrices?.nonAc?.roundTrip?.hill ?? 0}
                      onChange={(event) => {
                        const val = Number(event.target.value) || 0;
                        setEditingVehicle(prev => ({
                          ...prev,
                          perKmPrices: { ...prev.perKmPrices, nonAc: { ...prev.perKmPrices.nonAc, roundTrip: { normal: prev.perKmPrices.nonAc.roundTrip.normal, hill: val } } }
                        }));
                      }}
                      className={adminInputClass}
                    />
                  </AdminField>
                </div>
              </div>
              )}

              <div className="border-t pt-4">
                <h4 className="mb-4 font-semibold text-charcoal">Package Day Prices</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  {["day1", "day2", "day3", "day4", "day5"].map((day) => (
                    <AdminField key={day} label={`Day ${day.replace("day", "")} Normal`}>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingVehicle.package1Prices?.[day as keyof typeof editingVehicle.package1Prices]?.acNormal ?? 0}
                        onChange={(event) => {
                          const val = Number(event.target.value) || 0;
                          setEditingVehicle(prev => ({
                            ...prev,
                            package1Prices: {
                              ...prev.package1Prices,
                              [day]: {
                                ...(prev.package1Prices?.[day as keyof typeof prev.package1Prices] || { acNormal: 0, acHill: 0, nonAcNormal: 0, nonAcHill: 0 }),
                                acNormal: val
                              }
                            }
                          }));
                        }}
                        className={adminInputClass}
                      />
                    </AdminField>
                  ))}
                </div>
              </div>

              <AdminField label="Images (Upload)">
                <div className="grid gap-4 sm:grid-cols-2">
                  {(["img", "img2"] as const).map((key) => (
                    <div key={key} className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-charcoal uppercase">{key}</label>
                      <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-border bg-gray-50 h-24 flex items-center justify-center group">
                        {editingVehicle[key] && (
                          <>
                            <img src={editingVehicle[key]} alt={key} className="h-24 w-full object-cover absolute inset-0" />
                            <button
                              type="button"
                              onClick={() => setEditingVehicle({ ...editingVehicle, [key]: "" })}
                              className="absolute top-1 right-1 z-20 rounded-full bg-red-500 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                              title="Delete image"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {!editingVehicle[key] && (
                          <input
                            ref={vehicleImageRefs[key]}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file || !file.type.startsWith("image/")) return;
                              const reader = new FileReader();
                              reader.onload = () => {
                                if (typeof reader.result === "string") {
                                  setEditingVehicle({ ...editingVehicle, [key]: reader.result });
                                }
                              };
                              reader.readAsDataURL(file);
                            }}
                            className="relative z-10 cursor-pointer px-4 py-2 text-sm"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </AdminField>
            </div>

            {/* Dialog footer */}
            <div className="border-t border-border px-6 py-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeVehicleDialog}
                className="rounded-xl border border-border px-4 py-3 text-sm font-semibold text-charcoal hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveVehicleChanges()}
                disabled={vehicleSaving}
                className="rounded-xl bg-charcoal px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity inline-flex items-center gap-2"
              >
                {vehicleSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  `${editingVehicleName ? "Update" : "Add"} Vehicle`
                )}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
