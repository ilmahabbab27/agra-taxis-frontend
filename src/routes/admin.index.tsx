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
  type VehicleCatalogItem,
  type VehicleFormInput,
  type StayPrices,
} from "@/lib/vehicle-catalog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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

const emptyStayPrices: StayPrices = { day1: 0, day2: 0, day3: 0, day4: 0, day5: 0 };

const emptyVehicleForm: VehicleFormInput = {
  name: "",
  category: "Cars",
  img: "/assets/car.jpg",
  seats: 4,
  acPricePerKm: 0,
  nonAcPricePerKm: 0,
  acAvailable: true,
  nonAcAvailable: true,
  stayPrices: { ...emptyStayPrices },
};

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
  const [imageUploading, setImageUploading] = useState(false);

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

  function updateStayPrice(day: keyof StayPrices, value: number) {
    setVehicleForm((current) => ({
      ...current,
      stayPrices: { ...(current.stayPrices ?? emptyStayPrices), [day]: value },
    }));
  }

  async function onVehicleImageUpload(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    setImageUploading(true);
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
      updateVehicleForm("img", fullUrl);
    } catch {
      // fallback: embed as base64 if upload fails
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") updateVehicleForm("img", reader.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setImageUploading(false);
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
      seats: vehicle.seats,
      acPricePerKm: vehicle.acPricePerKm,
      nonAcPricePerKm: vehicle.nonAcPricePerKm,
      acAvailable: vehicle.acAvailable,
      nonAcAvailable: vehicle.nonAcAvailable,
      stayPrices: vehicle.stayPrices ?? { ...emptyStayPrices },
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
    <div className="min-h-screen bg-secondary/40">
      <header className="sticky top-0 z-30 bg-charcoal text-white shadow-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Agra Taxis" className="h-9 w-9 rounded-full" />
            <div>
              <div className="font-display font-bold leading-tight">Agra Taxis</div>
              <div className="text-[10px] uppercase tracking-wider text-gold">Admin</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={exportJson}
              className="inline-flex items-center gap-2 rounded-full bg-gold/20 px-4 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/30"
            >
              <Download className="h-4 w-4" /> Export JSON
            </button>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/20"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-charcoal sm:text-3xl">Vehicle Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage public vehicle categories, seats, images, and per-kilometer rates.
          </p>
        </div>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-charcoal">Vehicles</h2>
              <p className="text-sm text-muted-foreground">
                Add, update, delete, search, and filter vehicles shown on the public site.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-charcoal">
              <Car className="h-4 w-4" />
              {filteredVehicles.length} of {adminVehicles.length} vehicles
            </span>
          </div>

          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <button
              type="button"
              onClick={openAddVehicleDialog}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-charcoal px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Add Vehicle
            </button>
            <form
              onSubmit={onCategorySubmit}
              className="flex flex-col gap-2 sm:flex-row sm:items-center"
            >
              <input
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                placeholder="New category"
                className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm text-charcoal outline-none focus:ring-2 focus:ring-gold sm:w-56"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-charcoal hover:bg-accent"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </button>
            </form>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search vehicles or categories..."
              className={adminInputClass}
            />
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className={adminInputClass}
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category === "All" ? "All categories" : category}
                </option>
              ))}
            </select>
            <select
              value={seatFilter}
              onChange={(event) => setSeatFilter(event.target.value)}
              className={adminInputClass}
            >
              <option value="all">All seats</option>
              {seatOptions.map((seats) => (
                <option key={seats} value={seats}>
                  {seats} seats
                </option>
              ))}
            </select>
            <select
              value={comfortFilter}
              onChange={(event) => setComfortFilter(event.target.value as typeof comfortFilter)}
              className={adminInputClass}
            >
              <option value="all">All comfort</option>
              <option value="ac">AC available</option>
              <option value="nonAc">Non AC available</option>
            </select>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle.name} className="rounded-xl border border-border bg-secondary p-3">
                <div className="grid grid-cols-[92px_1fr] gap-3">
                  <div className="aspect-[4/3] overflow-hidden rounded-lg border border-border bg-background">
                    <img
                      src={vehicle.img}
                      alt={vehicle.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-charcoal">{vehicle.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {vehicle.category} - {vehicle.seats} seats
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => editVehicle(vehicle)}
                          className="rounded-lg px-2 py-1 text-xs font-semibold text-charcoal hover:bg-accent"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setVehicleToDelete(vehicle)}
                          className="rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <span>
                        AC:{" "}
                        {vehicle.acAvailable ? `${formatLkr(vehicle.acPricePerKm)} / km` : "N/A"}
                      </span>
                      <span>
                        Non AC:{" "}
                        {vehicle.nonAcAvailable
                          ? `${formatLkr(vehicle.nonAcPricePerKm)} / km`
                          : "N/A"}
                      </span>
                    </div>
                    {vehicle.stayPrices && (
                      <div className="mt-2 rounded-lg bg-background border border-border px-2 py-1.5">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                          Stay charges
                        </p>
                        <div className="grid grid-cols-5 gap-1 text-[10px] text-charcoal text-center">
                          {([1, 2, 3, 4, 5] as const).map((d) => (
                            <div key={d}>
                              <div className="font-semibold">D{d}</div>
                              <div>{formatLkr(vehicle.stayPrices![`day${d}` as keyof StayPrices])}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredVehicles.length === 0 && (
            <div className="mt-5 rounded-xl border border-border bg-secondary p-8 text-center text-sm text-muted-foreground">
              No vehicles match these filters.
            </div>
          )}
        </section>

        <Dialog
          open={isVehicleDialogOpen}
          onOpenChange={(open) => {
            if (!open) closeVehicleDialog();
            else setIsVehicleDialogOpen(true);
          }}
        >
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle>{editingVehicleName ? "Update Vehicle" : "Add Vehicle"}</DialogTitle>
              <DialogDescription>
                Manage category, image preview, seats, and separate AC / Non AC pricing.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onVehicleSubmit} className="grid gap-4 sm:grid-cols-2">
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
                      <option key={category} value={category}>
                        {category}
                      </option>
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
              <div className="grid gap-3 rounded-xl bg-secondary p-3 sm:col-span-2 sm:grid-cols-[160px_1fr]">
                <div className="aspect-[4/3] overflow-hidden rounded-xl border border-border bg-background">
                  <img
                    src={vehicleForm.img}
                    alt={vehicleForm.name || "Vehicle preview"}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="grid content-center gap-3">
                  <AdminField label="Vehicle Image">
                    <input
                      type="file"
                      accept="image/*"
                      disabled={imageUploading}
                      onChange={(event) => onVehicleImageUpload(event.target.files?.[0])}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-charcoal file:mr-3 file:rounded-lg file:border-0 file:bg-charcoal file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white disabled:opacity-60"
                    />
                    {imageUploading && (
                      <p className="mt-1 text-xs text-muted-foreground">Uploading image…</p>
                    )}
                  </AdminField>
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
                <AdminField label="AC price per km">
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
                <AdminField label="Non AC price per km">
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
              </div>

              <div className="sm:col-span-2 rounded-xl border border-border p-4 grid gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Stay / Daily Additional Charges (Rs.)
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {([1, 2, 3, 4, 5] as const).map((d) => {
                    const key = `day${d}` as keyof StayPrices;
                    return (
                      <AdminField key={d} label={`Day ${d}`}>
                        <input
                          type="number"
                          min={0}
                          value={vehicleForm.stayPrices?.[key] ?? 0}
                          onChange={(event) => updateStayPrice(key, Number(event.target.value))}
                          className={adminInputClass}
                        />
                      </AdminField>
                    );
                  })}
                </div>
              </div>

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
