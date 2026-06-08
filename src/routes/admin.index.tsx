import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Car, Download, LogOut, Pencil, Plus } from "lucide-react";
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
  "7ft": { type: "7 FT", hillExtraPerKm: 10, start: 2500, extra: 160, upDown: 120, waiting: 600, waitingHour: 600, between100And130: 2500, maxUpDownKm: 150, dropMinKm: 100, dropMaxKm: 130 },
  "20ft": { type: "20 FT", hillExtraPerKm: 10, start: 18000, extra: 450, upDown: 300, waiting: 1500, waitingHour: 1500, between100And130: 11000, maxUpDownKm: 150, dropMinKm: 100, dropMaxKm: 130 },
  "8.5ft": { type: "8.5 FT", hillExtraPerKm: 10, start: 3500, extra: 180, upDown: 130, waiting: 700, waitingHour: 700, between100And130: 2000, maxUpDownKm: 150, dropMinKm: 100, dropMaxKm: 130 },
  "10.5ft": { type: "10.5 FT", hillExtraPerKm: 10, start: 6000, extra: 230, upDown: 170, waiting: 800, waitingHour: 800, between100And130: 4500, maxUpDownKm: 150, dropMinKm: 100, dropMaxKm: 130 },
  "12.5ft": { type: "12.5 FT", hillExtraPerKm: 10, start: 7500, extra: 250, upDown: 180, waiting: 800, waitingHour: 800, between100And130: 4500, maxUpDownKm: 150, dropMinKm: 100, dropMaxKm: 130 },
  "14.5ft": { type: "14.5 FT", hillExtraPerKm: 10, start: 10000, extra: 320, upDown: 210, waiting: 1000, waitingHour: 1000, between100And130: 7000, maxUpDownKm: 150, dropMinKm: 100, dropMaxKm: 130 },
  "16.5ft": { type: "16.5 FT", hillExtraPerKm: 10, start: 11000, extra: 330, upDown: 220, waiting: 1000, waitingHour: 1000, between100And130: 8000, maxUpDownKm: 150, dropMinKm: 100, dropMaxKm: 130 },
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
  const [currentLorry, setCurrentLorry] = useState<VehicleCatalogItem | null>(null);

  useEffect(() => {
    if (!isAdminAuthed()) {
      navigate("/admin/login");
      return;
    }
    void refreshVehicles();
    setReady(true);
  }, [navigate]);

  async function refreshVehicles() {
    try {
      const [vehicles, categories, lorries] = await Promise.all([
        getVehiclesFromDatabase(),
        getVehicleCategoriesFromDatabase(),
        getLorriesFromDatabase(),
      ]);
      const byName = new Map<string, VehicleCatalogItem>();
      [...vehicles, ...lorries].forEach((vehicle) => byName.set(vehicle.name, vehicle));
      const lorryWithRates = lorries.find((vehicle) => vehicle.lorryRates && Object.keys(vehicle.lorryRates).length);
      const firstLorry = lorryWithRates ?? lorries[0];
      setAdminVehicles(Array.from(byName.values()));
      setCurrentLorry(firstLorry ?? null);
      setLorryRates(lorryWithRates?.lorryRates ?? emptyLorryRates);
      if (firstLorry) {
        setLorryImageForm({
          img: firstLorry.img,
          img2: firstLorry.img2,
          img3: firstLorry.img3,
          img4: firstLorry.img4,
          img5: firstLorry.img5,
        });
      }
      setCategoryOptions(categories);
    } catch {
      const fallbackVehicles = getVehicles();
      const firstLorry = fallbackVehicles.find((vehicle) => vehicle.category.toLowerCase().includes("lorry"));
      setAdminVehicles(fallbackVehicles);
      if (firstLorry) {
        setLorryRates(firstLorry.lorryRates ?? emptyLorryRates);
        setLorryImageForm({
          img: firstLorry.img,
          img2: firstLorry.img2,
          img3: firstLorry.img3,
          img4: firstLorry.img4,
          img5: firstLorry.img5,
        });
      }
      setCategoryOptions(getVehicleCategories());
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

  function updateLorryRate(key: string, field: keyof LorryRateRow, value: string | number) {
    setLorryRates((current) => ({
      ...current,
      [key]: {
        ...(current[key] ?? emptyLorryRates["7ft"]),
        [field]: field === "type" ? String(value) : Number(value),
      },
    }));
  }

  function updateAllLorryRates(field: "hillExtraPerKm" | "maxUpDownKm" | "dropMinKm" | "dropMaxKm", value: number) {
    setLorryRates((current) => Object.fromEntries(
      Object.entries(current).map(([key, row]) => [key, { ...row, [field]: value }]),
    ) as LorryRates);
  }

  function updateLorryImageForm(key: ImageSlot, value: string | undefined) {
    setLorryImageForm((current) => ({ ...current, [key]: value }));
  }

  async function saveLorryRates() {
    setLorrySaveStatus("Saving...");
    const lorryVehicle: VehicleFormInput = {
      ...(currentLorry ?? emptyVehicleForm),
      name: currentLorry?.name || "Agra Lorry",
      category: currentLorry?.category || "Lorries",
      img: lorryImageForm.img || currentLorry?.img || "/assets/car.jpg",
      img2: lorryImageForm.img2,
      img3: lorryImageForm.img3,
      img4: lorryImageForm.img4,
      img5: lorryImageForm.img5,
      seats: currentLorry?.seats || 2,
      acAvailable: currentLorry?.acAvailable ?? true,
      nonAcAvailable: currentLorry?.nonAcAvailable ?? true,
      lorryRates,
    };
    try {
      await saveLorryToDatabase(lorryVehicle, currentLorry?.id);
      await refreshVehicles();
      setLorrySaveStatus("Saved");
      setIsLorryEditing(false);
    } catch {
      saveCustomVehicle(lorryVehicle);
      await refreshVehicles();
      setLorrySaveStatus("Saved locally");
      setIsLorryEditing(false);
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
    try {
      await saveVehicleToDatabase(vehicleForm, editingVehicle?.id);
    } catch (error) {
      setVehicleSaveError(error instanceof Error ? error.message : "Could not save vehicle.");
      return;
    }
    await refreshVehicles();
    closeVehicleDialog();
  }

  async function onCategorySubmit(event: FormEvent) {
    event.preventDefault();
    const category = newCategory.trim();
    if (!category) return;
    try {
      await saveCategoryToDatabase(category);
    } catch {
      saveCustomCategory(category);
    }
    setNewCategory("");
    setVehicleForm((current) => ({ ...current, category }));
    await refreshVehicles();
  }

  function editVehicle(vehicle: VehicleCatalogItem) {
    setEditingVehicleName(vehicle.name);
    setVehicleForm({
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
    });
    setIsVehicleDialogOpen(true);
  }

  function resetVehicleForm() {
    setVehicleForm(emptyVehicleForm);
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
              <form onSubmit={onCategorySubmit} className="flex gap-2">
                <input
                  value={newCategory}
                  onChange={(event) => setNewCategory(event.target.value)}
                  placeholder="New category..."
                  className="w-36 rounded-lg border border-border bg-[#f0f2f5] px-3 py-2 text-sm text-charcoal outline-none transition-all focus:border-gold/40 focus:ring-1 focus:ring-gold/20"
                />
                <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-[#f4f5f7] px-3 py-2 text-sm font-semibold text-charcoal hover:bg-accent transition-colors">
                  <Plus className="h-3.5 w-3.5" /> Category
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
                      <p className="text-[10px] text-charcoal">Package 1: up to 100 km/day</p>
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

            {visibleFleetItems.length === 0 && (
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
                  <p className="text-xs text-muted-foreground">Vehicle-specific rate table. Add one row per lorry type.</p>
                </div>
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
            <div className="p-5">
              <div className="mb-5 rounded-xl border border-border bg-[#f8f9fb] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lorry Images</p>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  {([
                    ["img", "Primary image"],
                    ["img2", "Second image"],
                    ["img3", "Third image"],
                    ["img4", "Fourth image"],
                    ["img5", "Fifth image"],
                  ] as Array<[ImageSlot, string]>).map(([slot, label]) => (
                    <VehicleImageInput
                      key={slot}
                      label={label}
                      image={lorryImageForm[slot]}
                      alt={`Lorry ${label.toLowerCase()}`}
                      uploading={lorryImageUploading === slot}
                      disabled={!isLorryEditing || Boolean(lorryImageUploading)}
                      onUpload={(file) => onLorryImageUpload(file, slot)}
                    />
                  ))}
                </div>
              </div>
              <LorryRateEditorTable
                rates={lorryRates}
                onChange={updateLorryRate}
                onChangeAll={updateAllLorryRates}
                disabled={!isLorryEditing}
              />
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
                  disabled={!isLorryEditing}
                  onClick={() => void saveLorryRates()}
                  className="rounded-xl bg-charcoal px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Save Lorry Rates
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === "invoices" && (
          <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-base font-bold text-charcoal">Invoices / Quotations</h2>
              <p className="text-xs text-muted-foreground">Fill the blanks and download a printable PDF. Nothing is saved.</p>
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
              <DialogDescription className="mt-0.5 text-sm text-muted-foreground">
                {editingVehicleName ? `Editing ${editingVehicleName}` : "Fill in the details below to add a vehicle to the fleet."}
              </DialogDescription>
            </div>
            <form onSubmit={onVehicleSubmit} className="grid gap-5 p-6 sm:grid-cols-2">
              <AdminField label="Vehicle Name" className="sm:col-span-2">
                <input
                  required
                  value={vehicleForm.name}
                  onChange={(event) => updateVehicleForm("name", event.target.value)}
                  placeholder="e.g. Toyota Prius"
                  className={adminInputClass}
                />
              </AdminField>
              <AdminField label="Category">
                <select
                  value={vehicleForm.category}
                  onChange={(event) => updateVehicleForm("category", event.target.value)}
                  className={adminInputClass}
                >
                  {categoryOptions
                    .filter((category) => category !== "All")
                    .map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                </select>
              </AdminField>
              <AdminField label="Seats">
                <input
                  required
                  type="number"
                  min={1}
                  value={vehicleForm.seats}
                  onChange={(event) => updateVehicleForm("seats", Number(event.target.value))}
                  className={adminInputClass}
                />
              </AdminField>

              {/* Image section */}
              <div className="sm:col-span-2 rounded-xl border border-border bg-[#f8f9fb] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vehicle Images</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <VehicleImageInput
                    label="Primary image"
                    image={vehicleForm.img}
                    alt={vehicleForm.name || "Primary vehicle preview"}
                    uploading={imageUploading === "img"}
                    disabled={Boolean(imageUploading)}
                    onUpload={(file) => onVehicleImageUpload(file, "img")}
                  />
                  <VehicleImageInput
                    label="Second image"
                    image={vehicleForm.img2}
                    alt={vehicleForm.name || "Second vehicle preview"}
                    uploading={imageUploading === "img2"}
                    disabled={Boolean(imageUploading)}
                    onUpload={(file) => onVehicleImageUpload(file, "img2")}
                  />
                </div>
              </div>
              <div className="grid gap-3 rounded-xl border border-border p-3">
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal">
                  <input
                    type="checkbox"
                    checked={vehicleForm.acAvailable}
                    onChange={(event) => updateVehicleForm("acAvailable", event.target.checked)}
                  />
                  AC available
                </label>
                <AdminField label="AC one-way normal charge per km">
                  <input
                    type="number"
                    min={0}
                    disabled={!vehicleForm.acAvailable}
                    value={vehicleForm.acPricePerKm}
                    onChange={(event) =>
                      updateVehicleForm("acPricePerKm", Number(event.target.value))
                    }
                    className={adminInputClass}
                  />
                </AdminField>
                <AdminField label="AC hill country charge per km">
                  <input
                    type="number"
                    min={0}
                    disabled={!vehicleForm.acAvailable}
                    value={vehicleForm.acHillPricePerKm}
                    onChange={(event) =>
                      updateVehicleForm("acHillPricePerKm", Number(event.target.value))
                    }
                    className={adminInputClass}
                  />
                </AdminField>
                <AdminField label="AC round-trip normal charge per km">
                  <input
                    type="number"
                    min={0}
                    disabled={!vehicleForm.acAvailable}
                    value={vehicleForm.perKmPrices?.ac.roundTrip.normal ?? 0}
                    onChange={(event) => updatePerKmPrice("ac", "roundTrip", "normal", Number(event.target.value))}
                    className={adminInputClass}
                  />
                </AdminField>
                <AdminField label="AC round-trip hill charge per km">
                  <input
                    type="number"
                    min={0}
                    disabled={!vehicleForm.acAvailable}
                    value={vehicleForm.perKmPrices?.ac.roundTrip.hill ?? 0}
                    onChange={(event) => updatePerKmPrice("ac", "roundTrip", "hill", Number(event.target.value))}
                    className={adminInputClass}
                  />
                </AdminField>
              </div>
              <div className="grid gap-3 rounded-xl border border-border p-3">
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal">
                  <input
                    type="checkbox"
                    checked={vehicleForm.nonAcAvailable}
                    onChange={(event) => updateVehicleForm("nonAcAvailable", event.target.checked)}
                  />
                  Non AC available
                </label>
                <AdminField label="Non AC one-way normal charge per km">
                  <input
                    type="number"
                    min={0}
                    disabled={!vehicleForm.nonAcAvailable}
                    value={vehicleForm.nonAcPricePerKm}
                    onChange={(event) =>
                      updateVehicleForm("nonAcPricePerKm", Number(event.target.value))
                    }
                    className={adminInputClass}
                  />
                </AdminField>
                <AdminField label="Non AC hill country charge per km">
                  <input
                    type="number"
                    min={0}
                    disabled={!vehicleForm.nonAcAvailable}
                    value={vehicleForm.nonAcHillPricePerKm}
                    onChange={(event) =>
                      updateVehicleForm("nonAcHillPricePerKm", Number(event.target.value))
                    }
                    className={adminInputClass}
                  />
                </AdminField>
                <AdminField label="Non AC round-trip normal charge per km">
                  <input
                    type="number"
                    min={0}
                    disabled={!vehicleForm.nonAcAvailable}
                    value={vehicleForm.perKmPrices?.nonAc.roundTrip.normal ?? 0}
                    onChange={(event) => updatePerKmPrice("nonAc", "roundTrip", "normal", Number(event.target.value))}
                    className={adminInputClass}
                  />
                </AdminField>
                <AdminField label="Non AC round-trip hill charge per km">
                  <input
                    type="number"
                    min={0}
                    disabled={!vehicleForm.nonAcAvailable}
                    value={vehicleForm.perKmPrices?.nonAc.roundTrip.hill ?? 0}
                    onChange={(event) => updatePerKmPrice("nonAc", "roundTrip", "hill", Number(event.target.value))}
                    className={adminInputClass}
                  />
                </AdminField>
              </div>

              <PackagePriceTable
                title="Package 1"
                kmLimit={100}
                prices={vehicleForm.package1Prices ?? emptyPackagePrices}
                acAvailable={vehicleForm.acAvailable}
                nonAcAvailable={vehicleForm.nonAcAvailable}
                onAddDay={addPackageDay}
                onRemoveDay={removePackageDay}
                onChange={updatePackagePrice}
              />
              {vehicleSaveError && (
                <div className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {vehicleSaveError}
                </div>
              )}
              <DialogFooter className="sm:col-span-2">
                <button
                  type="button"
                  onClick={closeVehicleDialog}
                  className="inline-flex items-center justify-center rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-charcoal hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-charcoal px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
                >
                  {editingVehicleName ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editingVehicleName ? "Update Vehicle" : "Add Vehicle"}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={Boolean(vehicleToDelete)}
          onOpenChange={(open) => {
            if (!open) setVehicleToDelete(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
              <AlertDialogDescription>
                {vehicleToDelete
                  ? `Delete ${vehicleToDelete.name}? This removes it from admin vehicles, the public vehicles section, and the booking dropdown on this browser.`
                  : "Delete this vehicle?"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  if (!vehicleToDelete) return;
                  void (async () => {
                    try {
                      await deleteVehicleFromDatabase(vehicleToDelete);
                    } catch {
                      deleteVehicle(vehicleToDelete.name);
                    }
                    if (editingVehicleName === vehicleToDelete.name) closeVehicleDialog();
                    await refreshVehicles();
                    setVehicleToDelete(null);
                  })();
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}

function AdminField({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function PreviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-[#f8f9fb] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-charcoal">{value}</p>
    </div>
  );
}

function InvoicePreview({ form }: { form: QuotationForm }) {
  const rate = formatQuotationMoney(form.rate);
  const amount = formatQuotationNumber(form.amount);

  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-charcoal">Live Preview</h3>
          <p className="text-xs text-muted-foreground">Updates as you type</p>
        </div>
        <p className="rounded-full bg-[#f8f9fb] px-3 py-1 text-xs font-semibold text-muted-foreground">{form.documentType}</p>
      </div>
      <div className="rounded-xl border border-border bg-white p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Agra Taxis" className="h-12 w-12 rounded-lg border border-border bg-white object-contain" />
            <div>
              <p className="text-lg font-bold text-charcoal">Agra Taxis</p>
              <p className="text-xs text-muted-foreground">Sri Lanka's trusted islandwide vehicle rental and taxi service</p>
              <p className="text-xs font-semibold text-muted-foreground">{form.documentType}</p>
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>DATE : {form.date || "........................"}</p>
            <p>VEHICLE NO : {form.vehicleNo || "........................"}</p>
            <p>CAB NO : {form.cabNo || "........................"}</p>
            <p>TEL : {form.tel || "........................"}</p>
          </div>
        </div>

        <div className="my-4 border-t border-border" />

        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <PreviewField label="Customer's Name" value={form.customerName || "...................."} />
          <PreviewField label="Description" value={form.description || form.vehicle || "...................."} />
          <PreviewField label="No. Of Kms" value={form.noOfKms || form.days || "...................."} />
          <PreviewField label="Meter Reading Start" value={form.meterReadingStart || "...................."} />
          <PreviewField label="Meter Reading End" value={form.meterReadingEnd || "...................."} />
          <PreviewField label="Rate" value={formatQuotationMoney(form.rate, "....................")} />
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-[2fr_1fr_1fr] bg-[#f8f9fb] px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <div>Description</div>
            <div>Rate</div>
            <div>Amount</div>
          </div>
          {[
            [`For First ${form.firstKms || ".............................."} Kms`, rate, `Rs. ${amount}`],
            [`Extra Additional ${form.extraKms || "..............................."} Kms`, rate, formatQuotationMoney(form.extraKms)],
            [`${form.packageHours || "............................"} Hrs Package With ${form.packageWith || "............................"}`, rate, ""],
            [`Extra Additional ${form.extraHours || "..............................."} Hrs`, rate, ""],
            ["Loading Charges", "", formatQuotationMoney(form.loadingCharges)],
            ["Pickup Charges", "", formatQuotationMoney(form.pickupCharges)],
          ].map(([desc, rowRate, rowAmount]) => (
            <div key={desc} className="grid grid-cols-[2fr_1fr_1fr] border-t border-border px-3 py-2 text-xs">
              <div>{desc}</div>
              <div>{rowRate}</div>
              <div>{rowAmount}</div>
            </div>
          ))}
          <div className="grid grid-cols-[2fr_1fr_1fr] border-t border-border bg-[#f8f9fb] px-3 py-2 text-xs font-bold">
            <div>Total</div>
            <div />
            <div>Rs. {amount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VehicleImageInput({
  label,
  image,
  alt,
  uploading,
  disabled,
  onUpload,
}: {
  label: string;
  image?: string;
  alt: string;
  uploading: boolean;
  disabled: boolean;
  onUpload: (file: File | undefined) => void;
}) {
  return (
    <div className="grid gap-3">
      <p className="text-xs font-semibold text-charcoal">{label}</p>
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-white shadow-soft">
        {image ? (
          <img src={image} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs font-semibold text-muted-foreground">
            No image
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
              <span className="text-xs font-medium text-charcoal">Uploading...</span>
            </div>
          </div>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        disabled={disabled}
        onChange={(event) => onUpload(event.target.files?.[0])}
        className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-charcoal file:mr-3 file:rounded-lg file:border-0 file:bg-charcoal file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white disabled:opacity-60"
      />
    </div>
  );
}

function PackagePriceTable({
  title,
  kmLimit,
  prices,
  acAvailable,
  nonAcAvailable,
  onAddDay,
  onRemoveDay,
  onChange,
}: {
  title: string;
  kmLimit: number;
  prices: PackagePrices;
  acAvailable: boolean;
  nonAcAvailable: boolean;
  onAddDay: () => void;
  onRemoveDay: (day: keyof PackagePrices) => void;
  onChange: (day: keyof PackagePrices, priceKey: keyof DayPrices, value: number) => void;
}) {
  const columns: Array<{ key: keyof DayPrices; label: string }> = [];
  if (acAvailable) {
    columns.push({ key: "acNormal", label: "AC normal" }, { key: "acHill", label: "AC hill" });
  }
  if (nonAcAvailable) {
    columns.push(
      { key: "nonAcNormal", label: "Non AC normal" },
      { key: "nonAcHill", label: "Non AC hill" },
    );
  }
  const dayKeys = getPackageDayKeys(prices);

  return (
    <div className="sm:col-span-2 rounded-xl border border-border p-4">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
          <p className="text-sm font-semibold text-charcoal">Per-day package charges</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs font-medium text-muted-foreground">Allows up to {kmLimit} km each day</p>
          <button
            type="button"
            onClick={onAddDay}
            className="rounded-lg bg-charcoal px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
          >
            Add Day
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="w-20 px-2 py-2 font-semibold">Day</th>
              {columns.map((column) => (
                <th key={column.key} className="px-2 py-2 font-semibold">{column.label}</th>
              ))}
              <th className="w-24 px-2 py-2 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {dayKeys.map((day) => {
              const dayNumber = Number(String(day).replace("day", ""));
              return (
                <tr key={day} className="border-b border-border/70 last:border-0">
                  <td className="px-2 py-2 text-xs font-semibold text-charcoal">Day {dayNumber}</td>
                  {columns.map((column) => (
                    <td key={column.key} className="px-2 py-2">
                      <input
                        type="number"
                        min={0}
                        value={prices[day]?.[column.key] ?? 0}
                        onChange={(event) => onChange(day, column.key, Number(event.target.value))}
                        className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm text-charcoal outline-none focus:ring-2 focus:ring-gold"
                      />
                    </td>
                  ))}
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      disabled={dayKeys.length <= 1}
                      onClick={() => onRemoveDay(day)}
                      className="rounded-lg border border-red-100 bg-red-50 px-2 py-2 text-xs font-semibold text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LorryRateEditorTable({
  rates,
  onChange,
  onChangeAll,
  disabled = false,
}: {
  rates: LorryRates;
  onChange: (key: string, field: keyof LorryRateRow, value: string | number) => void;
  onChangeAll: (field: "hillExtraPerKm" | "maxUpDownKm" | "dropMinKm" | "dropMaxKm", value: number) => void;
  disabled?: boolean;
}) {
  const rows = Object.entries(rates);
  const firstRow = rows[0]?.[1] ?? emptyLorryRates["7ft"];
  const columns: Array<{ key: keyof LorryRateRow; label: string; type?: "text" | "number" }> = [
    { key: "type", label: "Type", type: "text" },
    { key: "hillExtraPerKm", label: "Hill / KM" },
    { key: "start", label: "Start" },
    { key: "extra", label: "Extra" },
    { key: "upDown", label: "Up & Down" },
    { key: "waiting", label: "Waiting" },
    { key: "waitingHour", label: "Waiting Hour" },
    { key: "between100And130", label: "Between 100-130 KM" },
    { key: "maxUpDownKm", label: "Up/Down Limit" },
    { key: "dropMinKm", label: "Drop Min" },
    { key: "dropMaxKm", label: "Drop Max" },
  ];

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lorry Rates</p>
          <p className="text-sm font-semibold text-charcoal">Vehicle-specific rate table</p>
        </div>
        <p className="text-xs font-medium text-muted-foreground">Add one row per lorry type</p>
      </div>

      <div className="mb-6 grid gap-3 lg:grid-cols-[1fr_1fr_1fr]">
        <AdminField label="Hill surcharge per km">
          <input
            type="number"
            min={0}
            value={firstRow.hillExtraPerKm}
            disabled={disabled}
            onChange={(event) => onChangeAll("hillExtraPerKm", Number(event.target.value))}
            className={adminInputClass}
          />
        </AdminField>
        <AdminField label="Up & down limit km">
          <input
            type="number"
            min={0}
            value={firstRow.maxUpDownKm}
            disabled={disabled}
            onChange={(event) => onChangeAll("maxUpDownKm", Number(event.target.value))}
            className={adminInputClass}
          />
        </AdminField>
        <AdminField label="Drop range">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={0}
              value={firstRow.dropMinKm}
              disabled={disabled}
              onChange={(event) => onChangeAll("dropMinKm", Number(event.target.value))}
              className={adminInputClass}
            />
            <input
              type="number"
              min={0}
              value={firstRow.dropMaxKm}
              disabled={disabled}
              onChange={(event) => onChangeAll("dropMaxKm", Number(event.target.value))}
              className={adminInputClass}
            />
          </div>
        </AdminField>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              {columns.map((column) => (
                <th key={column.key} className="px-2 py-2 font-semibold">{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([key, row]) => (
              <tr key={key} className="border-b border-border/70 last:border-0">
                {columns.map((column) => (
                  <td key={column.key} className="px-2 py-2">
                    <input
                      type={column.type === "text" ? "text" : "number"}
                      min={column.type === "text" ? undefined : 0}
                      value={row[column.key]}
                      disabled={disabled}
                      onChange={(event) => onChange(key, column.key, column.type === "text" ? event.target.value : Number(event.target.value))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm text-charcoal outline-none focus:ring-2 focus:ring-gold disabled:cursor-not-allowed disabled:opacity-70"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


