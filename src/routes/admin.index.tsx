import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Car, Download, LogOut, Pencil, Plus } from "lucide-react";
import { adminLogout, isAdminAuthed } from "@/lib/admin-store";
import { API_BASE } from "@/lib/api";
import {
  deleteVehicle,
  deleteVehicleFromDatabase,
  formatLkr,
  getVehicleCategories,
  getVehicleCategoriesFromDatabase,
  getVehiclesFromDatabase,
  getVehicles,
  saveCustomCategory,
  saveCustomVehicle,
  saveCategoryToDatabase,
  saveVehicleToDatabase,
  type DayPrices,
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
  const [ready, setReady] = useState(false);
  const [imageUploading, setImageUploading] = useState<"img" | "img2" | null>(null);

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
      const [vehicles, categories] = await Promise.all([
        getVehiclesFromDatabase(),
        getVehicleCategoriesFromDatabase(),
      ]);
      setAdminVehicles(vehicles);
      setCategoryOptions(categories);
    } catch {
      setAdminVehicles(getVehicles());
      setCategoryOptions(getVehicleCategories());
    }
  }

  function updateVehicleForm<K extends keyof VehicleFormInput>(key: K, value: VehicleFormInput[K]) {
    setVehicleForm((current) => ({ ...current, [key]: value }));
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

  async function onVehicleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!vehicleForm.name.trim()) return;
    const editingVehicle = adminVehicles.find((vehicle) => vehicle.name === editingVehicleName);
    try {
      await saveVehicleToDatabase(vehicleForm, editingVehicle?.id);
    } catch {
      if (editingVehicleName) deleteVehicle(editingVehicleName);
      saveCustomVehicle(vehicleForm);
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

  function exportJson() {
    const payload = {
      exportedAt: new Date().toISOString(),
      vehicles: adminVehicles,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
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
              onClick={exportJson}
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
          <h1 className="text-2xl font-bold tracking-tight text-charcoal">Fleet Management</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Manage vehicles, categories and pricing shown on the public site.</p>
        </div>

        {/* Stats row */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Vehicles", value: adminVehicles.length, accent: false },
            { label: "Categories", value: categoryOptions.filter(c => c !== "All").length, accent: false },
            { label: "AC Available", value: adminVehicles.filter(v => v.acAvailable).length, accent: false },
            { label: "Filtered Results", value: filteredVehicles.length, accent: true },
          ].map(({ label, value, accent }) => (
            <div key={label} className={`rounded-xl border px-4 py-3.5 ${accent ? "border-gold/20 bg-gold/5" : "border-border bg-white shadow-soft"}`}>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className={`mt-1 text-3xl font-bold ${accent ? "text-gold" : "text-charcoal"}`}>{value}</p>
            </div>
          ))}
        </div>

        <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
          {/* Section toolbar */}
          <div className="flex flex-col gap-3 border-b border-border bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-charcoal">Vehicles</h2>
              <p className="text-xs text-muted-foreground">{adminVehicles.length} vehicles across {categoryOptions.filter(c => c !== "All").length} categories</p>
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
                onClick={openAddVehicleDialog}
                className="inline-flex items-center gap-1.5 rounded-lg bg-charcoal px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                <Plus className="h-3.5 w-3.5" /> Add Vehicle
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
              {filteredVehicles.map((vehicle) => (
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

            {filteredVehicles.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 rounded-full border border-border bg-[#f8f9fb] p-5">
                  <Car className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="font-semibold text-charcoal">No vehicles found</p>
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or add a new vehicle.</p>
                <button onClick={openAddVehicleDialog} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-charcoal px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                  <Plus className="h-3.5 w-3.5" /> Add Vehicle
                </button>
              </div>
            )}
          </div>
        </section>

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
