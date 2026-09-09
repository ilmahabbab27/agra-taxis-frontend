import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ExternalLink, Eye, LogOut, Pencil, Search, SlidersHorizontal, X } from "lucide-react";
import { adminLogout, isAdminAuthed } from "@/lib/admin-store";
import { API_BASE } from "@/lib/api";
import {
  getDriverRegistrations,
  updateDriverRegistration,
  updateDriverStatus,
  type DriverRegistration,
} from "@/lib/driver-portal";
import { districtsByProvince, provinces } from "@/lib/sri-lanka-locations";

function DocumentLinks({ files, label }: { files: string[]; label: string }) {
  const documentUrl = (file: string) =>
    file.startsWith("http") || file.startsWith("data:")
      ? file
      : `${API_BASE.replace(/\/api$/, "")}/storage/app/public/${file.startsWith("driver-documents/") ? file : `driver-documents/${encodeURIComponent(file)}`}`;
  return (
    <div className="space-y-1">
      {files.length ? (
        files.map((file, index) => {
          const url = documentUrl(file);
          const isImage =
            /\.(jpe?g|png|gif|webp|avif)$/i.test(file) || file.startsWith("data:image/");
          const isPdf = /\.pdf$/i.test(file) || file.startsWith("data:application/pdf");
          return (
            <div key={`${file}-${index}`}>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="block max-w-[210px] truncate rounded bg-[#f7f5ef] px-2 py-1 text-xs text-gold hover:underline"
                title={file}
              >
                {label} {index + 1}: {file}
              </a>
              {isImage && (
                <img
                  src={url}
                  alt={`${label} ${index + 1}`}
                  className="mt-1 h-20 w-28 rounded-lg border object-cover"
                />
              )}
              {isPdf && (
                <iframe
                  title={`${label} ${index + 1} preview`}
                  src={url}
                  className="mt-1 h-24 w-40 rounded-lg border"
                />
              )}
            </div>
          );
        })
      ) : (
        <span className="text-xs text-muted-foreground">Not uploaded</span>
      )}
    </div>
  );
}

export default function AdminDrivers() {
  const navigate = useNavigate();
  const [items, setItems] = useState<DriverRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [acFilter, setAcFilter] = useState("all");
  const [selected, setSelected] = useState<DriverRegistration | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<DriverRegistration | null>(null);
  const [editFiles, setEditFiles] = useState<{
    vehiclePhotoFiles: File[];
    driverDocumentFile?: File;
    insuranceDocumentFile?: File;
  }>({ vehiclePhotoFiles: [] });
  const [editPreviews, setEditPreviews] = useState<{
    photos: string[];
    driver: string;
    insurance: string;
  }>({ photos: [], driver: "", insurance: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editPassword, setEditPassword] = useState("");
  useEffect(() => {
    if (!isAdminAuthed()) {
      navigate("/admin/login");
      return;
    }
    void getDriverRegistrations()
      .then((registrations) => {
        setItems(registrations);
        setLoadError("");
      })
      .catch((error: unknown) => {
        console.error("AdminDrivers could not load applications", error);
        setLoadError(error instanceof Error ? error.message : "Unable to load driver applications.");
      })
      .finally(() => setLoading(false));
  }, [navigate]);
  async function changeStatus(id: string, status: DriverRegistration["status"]) {
    await updateDriverStatus(id, status);
    setItems((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
  }
  const provinces = [...new Set(items.map((item) => item.province).filter(Boolean))].sort();
  const districts = [...new Set(items.map((item) => item.district).filter(Boolean))].sort();
  const categories = [...new Set(items.map((item) => item.vehicleCategory).filter(Boolean))].sort();
  const normalizedSearch = search.trim().toLowerCase();
  const filteredItems = items.filter((item) => {
    const searchable = [
      item.fullName,
      item.email,
      item.phone,
      item.username,
      item.province,
      item.district,
      item.location,
      item.vehicleCategory,
      item.vehicleName,
      item.vehicleRegistrationNumber,
      item.vehicleColour,
    ]
      .join(" ")
      .toLowerCase();
    return (
      (!normalizedSearch || searchable.includes(normalizedSearch)) &&
      (statusFilter === "all" || item.status === statusFilter) &&
      (provinceFilter === "all" || item.province === provinceFilter) &&
      (districtFilter === "all" || item.district === districtFilter) &&
      (categoryFilter === "all" || item.vehicleCategory === categoryFilter) &&
      (acFilter === "all" || item.airConditioning === acFilter)
    );
  });
  const filtersActive = Boolean(
    search ||
      statusFilter !== "all" ||
      provinceFilter !== "all" ||
      districtFilter !== "all" ||
      categoryFilter !== "all" ||
      acFilter !== "all",
  );
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setProvinceFilter("all");
    setDistrictFilter("all");
    setCategoryFilter("all");
    setAcFilter("all");
  };
  return (
    <div className="min-h-screen bg-[#f7f5ef] text-charcoal">
      <header className="bg-charcoal px-5 py-5 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <Link to="/admin" className="text-xs text-white/60">
              &larr; Admin panel
            </Link>
            <h1 className="mt-2 text-xl font-bold">Driver applications</h1>
          </div>
          <button
            onClick={async () => {
              await adminLogout();
              navigate("/admin/login");
            }}
            className="inline-flex gap-2 text-sm"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Independent driver network</p>
            <h2 className="text-2xl font-bold">
              {filteredItems.length} applications
              {filteredItems.length !== items.length && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  of {items.length}
                </span>
              )}
            </h2>
          </div>
          <Link to="/drivers/register" className="text-sm font-bold text-gold">
            View registration portal <ExternalLink className="ml-1 inline h-4 w-4" />
          </Link>
        </div>
        {!loading && !loadError && items.length > 0 && (
          <div className="mb-5 rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold">
              <SlidersHorizontal className="h-4 w-4 text-gold" />
              Search and filters
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <label className="relative xl:col-span-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search driver, phone, vehicle..."
                  className="w-full rounded-xl border border-border py-2.5 pl-9 pr-3 text-sm outline-none focus:border-gold"
                />
              </label>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-border px-3 py-2.5 text-sm">
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select value={provinceFilter} onChange={(event) => setProvinceFilter(event.target.value)} className="rounded-xl border border-border px-3 py-2.5 text-sm">
                <option value="all">All provinces</option>
                {provinces.map((province) => <option key={province} value={province}>{province}</option>)}
              </select>
              <select value={districtFilter} onChange={(event) => setDistrictFilter(event.target.value)} className="rounded-xl border border-border px-3 py-2.5 text-sm">
                <option value="all">All districts</option>
                {districts.map((district) => <option key={district} value={district}>{district}</option>)}
              </select>
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-xl border border-border px-3 py-2.5 text-sm">
                <option value="all">All vehicle categories</option>
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
              <select value={acFilter} onChange={(event) => setAcFilter(event.target.value)} className="rounded-xl border border-border px-3 py-2.5 text-sm">
                <option value="all">AC and non AC</option>
                <option value="ac">AC</option>
                <option value="non_ac">Non AC</option>
              </select>
              {filtersActive && (
                <button type="button" onClick={clearFilters} className="rounded-xl border border-border px-3 py-2.5 text-sm font-semibold hover:bg-[#f7f5ef]">
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}
        {loading ? (
          <p>Loading applications...</p>
        ) : loadError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
            <p className="font-semibold">Could not load driver applications.</p>
            <p className="mt-2 text-sm">{loadError}</p>
            <p className="mt-3 text-xs text-red-600/80">
              Deploy the latest Laravel backend routes and clear the production route cache.
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-muted-foreground">
            No driver applications yet.
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-muted-foreground">
            No applications match the current search or filters.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-soft">
            <table className="min-w-[1420px] w-full text-left text-sm">
              <thead className="bg-charcoal text-xs uppercase tracking-wider text-white/75">
                <tr>
                  <th className="px-4 py-4">Driver</th>
                  <th className="px-4 py-4">Contact</th>
                  <th className="px-4 py-4">Location</th>
                  <th className="px-4 py-4">Vehicle</th>
                  <th className="px-4 py-4">Vehicle photos</th>
                  <th className="px-4 py-4">Driver document</th>
                  <th className="px-4 py-4">Insurance</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="align-top hover:bg-[#f7f5ef]/70">
                    <td className="px-4 py-5">
                      <p className="font-bold">{item.fullName}</p>
                      {item.username && (
                        <p className="mt-1 text-xs text-muted-foreground">@{item.username}</p>
                      )}
                    </td>
                    <td className="px-4 py-5">
                      <p>{item.email}</p>
                      <p className="mt-1 text-muted-foreground">{item.phone}</p>
                    </td>
                    <td className="px-4 py-5">
                      <p className="font-semibold">{item.province}</p>
                      <p className="text-muted-foreground">{item.district}</p>
                      <p className="text-xs">{item.location}</p>
                    </td>
                    <td className="px-4 py-5">
                      <p className="font-semibold">{item.vehicleName}</p>
                      <p className="text-muted-foreground">
                        {item.vehicleCategory} · {item.vehicleColour}
                      </p>
                      <p className="text-xs">
                        {item.vehicleRegistrationNumber} · {item.seatCapacity} seats ·{" "}
                        {item.airConditioning === "ac" ? "AC" : "Non AC"}
                      </p>
                    </td>
                    <td className="px-4 py-5">
                      <DocumentLinks files={item.vehiclePhotos} label="Photo" />
                    </td>
                    <td className="px-4 py-5">
                      <DocumentLinks
                        files={item.driverDocument ? [item.driverDocument] : []}
                        label="Driver"
                      />
                    </td>
                    <td className="px-4 py-5">
                      <DocumentLinks
                        files={item.insuranceDocument ? [item.insuranceDocument] : []}
                        label="Insurance"
                      />
                    </td>
                    <td className="px-4 py-5">
                      <select
                        value={item.status}
                        onChange={(event) =>
                          void changeStatus(
                            item.id,
                            event.target.value as DriverRegistration["status"],
                          )
                        }
                        className="rounded-xl border border-border px-3 py-2 text-sm font-semibold"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-4 py-5">
                      <button
                        type="button"
                        onClick={() => setSelected(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-charcoal px-3 py-2 text-xs font-bold text-white hover:bg-gold hover:text-charcoal"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(item);
                          setDraft(item);
                          setEditFiles({ vehiclePhotoFiles: [] });
                          setEditPreviews({ photos: [], driver: "", insurance: "" });
                          setEditError("");
                          setEditPassword("");
                          setEditing(true);
                        }}
                        className="ml-1 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold hover:bg-[#f7f5ef]"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {selected && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-charcoal/60 p-4"
            onClick={() => setSelected(null)}
          >
            <div
              className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gold">
                    Driver application
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">{selected.fullName}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selected.email} · {selected.phone}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label="Close details"
                  className="rounded-full p-2 hover:bg-[#f7f5ef]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {editing && draft ? (
                <form
                  className="mt-6 grid gap-4 sm:grid-cols-2"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    setEditSaving(true);
                    setEditError("");
                    try {
                      const saved = await updateDriverRegistration(draft, {
                        ...editFiles,
                        password: editPassword,
                      });
                      setItems((current) =>
                        current.map((item) => (item.id === saved.id ? saved : item)),
                      );
                      setSelected(saved);
                      setDraft(saved);
                      setEditPassword("");
                      setEditing(false);
                    } catch (error) {
                      setEditError(
                        error instanceof Error ? error.message : "Could not save changes.",
                      );
                    } finally {
                      setEditSaving(false);
                    }
                  }}
                >
                  {(
                    [
                      "fullName",
                      "email",
                      "phone",
                      "location",
                      "vehicleCategory",
                      "vehicleName",
                      "vehicleRegistrationNumber",
                      "vehicleColour",
                    ] as const
                  ).map((key) => (
                    <label key={key} className="text-sm font-semibold">
                      {key.replace(/([A-Z])/g, " $1")}
                      <input
                        required
                        value={draft[key]}
                        onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
                        className="mt-1 w-full rounded-xl border border-border px-3 py-2 font-normal"
                      />
                    </label>
                  ))}
                  <label className="text-sm font-semibold">
                    Province
                    <select required value={draft.province} onChange={(event) => setDraft({ ...draft, province: event.target.value, district: "" })} className="mt-1 w-full rounded-xl border border-border px-3 py-2 font-normal">
                      <option value="">Select province</option>
                      {provinces.map((province) => <option key={province} value={province}>{province}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-semibold">
                    District
                    <select required value={draft.district} onChange={(event) => setDraft({ ...draft, district: event.target.value })} className="mt-1 w-full rounded-xl border border-border px-3 py-2 font-normal">
                      <option value="">Select district</option>
                      {(districtsByProvince[draft.province] || []).map((district) => <option key={district} value={district}>{district}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-semibold">
                    Seat capacity
                    <input
                      required
                      type="number"
                      min="1"
                      value={draft.seatCapacity}
                      onChange={(event) =>
                        setDraft({ ...draft, seatCapacity: Number(event.target.value) })
                      }
                      className="mt-1 w-full rounded-xl border border-border px-3 py-2 font-normal"
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    AC status
                    <select
                      value={draft.airConditioning}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          airConditioning: event.target.value as "ac" | "non_ac",
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-border px-3 py-2 font-normal"
                    >
                      <option value="ac">AC</option>
                      <option value="non_ac">Non AC</option>
                    </select>
                  </label>
                  <label className="text-sm font-semibold">
                    Set driver password
                    <input
                      type="password"
                      minLength={8}
                      value={editPassword}
                      onChange={(event) => setEditPassword(event.target.value)}
                      placeholder="Leave blank to keep current"
                      className="mt-1 w-full rounded-xl border border-border px-3 py-2 font-normal"
                    />
                    <span className="mt-1 block text-xs font-normal text-muted-foreground">
                      Minimum 8 characters. This changes the driver login password.
                    </span>
                  </label>
                  <label className="text-sm font-semibold sm:col-span-2">
                    Replace vehicle photos (up to 5)
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="mt-1 block w-full text-xs font-normal"
                      onChange={(event) => {
                        const selectedFiles = Array.from(event.target.files || []);
                        const nextFiles = [...editFiles.vehiclePhotoFiles, ...selectedFiles].slice(
                          0,
                          5,
                        );
                        setEditFiles((current) => ({
                          ...current,
                          vehiclePhotoFiles: nextFiles,
                        }));
                        setEditPreviews((current) => ({
                          ...current,
                          photos: nextFiles.map((file) => URL.createObjectURL(file)),
                        }));
                        event.currentTarget.value = "";
                      }}
                    />
                    {editFiles.vehiclePhotoFiles.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {editFiles.vehiclePhotoFiles.length} replacement photo(s) selected
                      </span>
                    )}
                    {editFiles.vehiclePhotoFiles.length > 0 && (
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {editFiles.vehiclePhotoFiles.map((file, index) => (
                          <div key={`${file.name}-${index}`} className="relative">
                            <img
                              src={editPreviews.photos[index]}
                              alt={file.name}
                              className="aspect-[4/3] w-full rounded-lg border object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const files = editFiles.vehiclePhotoFiles.filter(
                                  (_, fileIndex) => fileIndex !== index,
                                );
                                setEditFiles((current) => ({
                                  ...current,
                                  vehiclePhotoFiles: files,
                                }));
                                setEditPreviews((current) => ({
                                  ...current,
                                  photos: files.map((item) => URL.createObjectURL(item)),
                                }));
                              }}
                              className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white"
                              aria-label={`Remove replacement photo ${index + 1}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </label>
                  <label className="text-sm font-semibold">
                    Replace driver document
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="mt-1 block w-full text-xs font-normal"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        setEditFiles((current) => ({ ...current, driverDocumentFile: file }));
                        if (file)
                          setEditPreviews((current) => ({
                            ...current,
                            driver: URL.createObjectURL(file),
                          }));
                      }}
                    />
                    {editPreviews.driver && (
                      <iframe
                        title="Replacement driver document preview"
                        src={editPreviews.driver}
                        className="mt-2 h-24 w-full rounded-lg border"
                      />
                    )}
                  </label>
                  <label className="text-sm font-semibold">
                    Replace insurance
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="mt-1 block w-full text-xs font-normal"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        setEditFiles((current) => ({ ...current, insuranceDocumentFile: file }));
                        if (file)
                          setEditPreviews((current) => ({
                            ...current,
                            insurance: URL.createObjectURL(file),
                          }));
                      }}
                    />
                    {editPreviews.insurance && (
                      <iframe
                        title="Replacement insurance preview"
                        src={editPreviews.insurance}
                        className="mt-2 h-24 w-full rounded-lg border"
                      />
                    )}
                  </label>
                  <div className="sm:col-span-2 flex justify-end gap-2">
                    {editError && (
                      <p className="mr-auto self-center text-sm font-semibold text-red-600">
                        {editError}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="rounded-xl border border-border px-4 py-2 text-sm font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-charcoal px-4 py-2 text-sm font-semibold text-white"
                    >
                      {editSaving ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-[#f7f5ef] p-4">
                    <p className="text-xs font-bold uppercase text-muted-foreground">Location</p>
                    <p className="mt-1 font-semibold">
                      {selected.province}, {selected.district}
                    </p>
                    <p className="text-sm">{selected.location}</p>
                  </div>
                  <div className="rounded-xl bg-[#f7f5ef] p-4">
                    <p className="text-xs font-bold uppercase text-muted-foreground">Vehicle</p>
                    <p className="mt-1 font-semibold">
                      {selected.vehicleName} · {selected.vehicleCategory}
                    </p>
                    <p className="text-sm">
                      {selected.vehicleRegistrationNumber} · {selected.vehicleColour} ·{" "}
                      {selected.seatCapacity} seats
                    </p>
                  </div>
                </div>
              )}
              <div className="mt-6 grid gap-5 sm:grid-cols-3">
                <div>
                  <h3 className="mb-2 font-bold">Vehicle photos</h3>
                  <DocumentLinks files={selected.vehiclePhotos} label="Photo" />
                </div>
                <div>
                  <h3 className="mb-2 font-bold">Driver document</h3>
                  <DocumentLinks
                    files={selected.driverDocument ? [selected.driverDocument] : []}
                    label="Driver document"
                  />
                  {editPreviews.insurance && (
                    <iframe
                      title="Replacement insurance preview"
                      src={editPreviews.insurance}
                      className="mt-2 h-24 w-full rounded-lg border"
                    />
                  )}
                </div>
                <div>
                  <h3 className="mb-2 font-bold">Insurance</h3>
                  <DocumentLinks
                    files={selected.insuranceDocument ? [selected.insuranceDocument] : []}
                    label="Insurance"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
