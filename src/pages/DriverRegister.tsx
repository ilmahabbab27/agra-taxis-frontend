import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  ImagePlus,
  MapPin,
  ShieldCheck,
  X,
} from "lucide-react";
import { registerDriver, type DriverRegistrationInput } from "@/lib/driver-portal";
import { districtsByProvince } from "@/lib/sri-lanka-locations";
const initial: DriverRegistrationInput = {
  fullName: "",
  email: "",
  phone: "",
  province: "",
  district: "",
  vehicleCategory: "",
  vehicleName: "",
  vehicleRegistrationNumber: "",
  vehicleColour: "",
  location: "",
  seatCapacity: 4,
  airConditioning: "ac",
  vehiclePhotos: [],
  driverDocument: "",
  insuranceDocument: "",
  password: "",
};

function fileName(file: File | undefined) {
  return file ? file.name : "";
}

function readPreview(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"];
const documentTypes = [...imageTypes, "application/pdf"];
const maxPhotoSize = 5 * 1024 * 1024;
const maxDocumentSize = 10 * 1024 * 1024;
const maxCombinedUploadSize = 45 * 1024 * 1024;

function hasFileType(file: File, types: string[]) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return types.includes(file.type) || (extension === "jpg" && types.includes("image/jpeg")) ||
    (extension === "jpeg" && types.includes("image/jpeg")) ||
    (extension === "png" && types.includes("image/png")) ||
    (extension === "gif" && types.includes("image/gif")) ||
    (extension === "webp" && types.includes("image/webp")) ||
    (extension === "avif" && types.includes("image/avif")) ||
    (extension === "pdf" && types.includes("application/pdf"));
}

export default function DriverRegister() {
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [documentPreviews, setDocumentPreviews] = useState({ driver: "", insurance: "" });
  const [vehiclePhotoFiles, setVehiclePhotoFiles] = useState<File[]>([]);
  const [driverDocumentFile, setDriverDocumentFile] = useState<File>();
  const [insuranceDocumentFile, setInsuranceDocumentFile] = useState<File>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (key: keyof DriverRegistrationInput, value: string | number | string[]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const clearError = (key: string) =>
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  const validate = () => {
    const next: Record<string, string> = {};
    const requiredFields: [keyof DriverRegistrationInput, string][] = [
      ["fullName", "Full name is required."], ["email", "Email address is required."],
      ["phone", "Phone number is required."], ["province", "Province is required."],
      ["district", "District is required."], ["location", "Operating location is required."],
      ["vehicleCategory", "Vehicle category is required."], ["vehicleName", "Vehicle name is required."],
      ["vehicleRegistrationNumber", "Registration number is required."], ["vehicleColour", "Vehicle colour is required."],
    ];
    requiredFields.forEach(([key, text]) => {
      if (!String(form[key] ?? "").trim()) next[key] = text;
    });
    if (form.fullName.trim() && (form.fullName.trim().length < 2 || form.fullName.trim().length > 100)) {
      next.fullName = "Full name must be between 2 and 100 characters.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (form.phone.trim() && !/^\+?[0-9\s()-]{7,20}$/.test(form.phone.trim())) next.phone = "Enter a valid phone number.";
    if (form.password.length < 8 || form.password.length > 72) next.password = "Password must be between 8 and 72 characters.";
    if (form.location.trim().length > 150) next.location = "Operating location must be 150 characters or fewer.";
    if (form.vehicleName.trim().length > 100) next.vehicleName = "Vehicle name must be 100 characters or fewer.";
    if (form.vehicleColour.trim().length > 50) next.vehicleColour = "Vehicle colour must be 50 characters or fewer.";
    if (form.vehicleRegistrationNumber.trim() && !/^[A-Za-z0-9\s-]{2,20}$/.test(form.vehicleRegistrationNumber.trim())) {
      next.vehicleRegistrationNumber = "Enter a valid registration number.";
    }
    if (!Number.isInteger(form.seatCapacity) || form.seatCapacity < 1 || form.seatCapacity > 100) {
      next.seatCapacity = "Seat capacity must be between 1 and 100.";
    }
    if (vehiclePhotoFiles.length < 1) next.vehiclePhotos = "Add at least one vehicle photo.";
    if (vehiclePhotoFiles.length > 5) next.vehiclePhotos = "You can add a maximum of 5 vehicle photos.";
    const uploadSize = vehiclePhotoFiles.reduce((total, file) => total + file.size, 0) +
      (driverDocumentFile?.size || 0) + (insuranceDocumentFile?.size || 0);
    if (uploadSize > maxCombinedUploadSize) next.vehiclePhotos = "Combined uploads must be 45 MB or less.";
    if (!driverDocumentFile) next.driverDocument = "Driver document is required.";
    if (!insuranceDocumentFile) next.insuranceDocument = "Insurance document is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };
  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      setMessage("Please correct the highlighted fields before submitting.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const result = await registerDriver({
        ...form,
        vehiclePhotoFiles,
        driverDocumentFile,
        insuranceDocumentFile,
      });
      console.info("Driver application saved by API", {
        status: "created",
        driverId: result?.driver?.id ?? result?.id ?? null,
        responseKeys: result && typeof result === "object" ? Object.keys(result) : [],
      });
      setMessage("Application received. Our team will review your documents and contact you.");
      setForm(initial);
      setPhotoPreviews([]);
      setDocumentPreviews({ driver: "", insurance: "" });
      setVehiclePhotoFiles([]);
      setDriverDocumentFile(undefined);
      setInsuranceDocumentFile(undefined);
      setErrors({});
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not submit application.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#f7f5ef] px-4 py-8 text-charcoal sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="font-display text-xl font-bold">
            Agra <span className="text-gold">Taxis</span>
          </Link>
          <Link to="/drivers/login" className="text-sm font-semibold hover:text-gold">
            Driver login
          </Link>
        </div>
        <div className="grid overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="bg-charcoal p-8 text-white sm:p-12">
            <p className="mb-10 text-xs font-bold uppercase tracking-[.2em] text-gold">
              Driver network
            </p>
            <h1 className="text-4xl font-bold leading-tight">
              Bring your vehicle to more journeys.
            </h1>
            <p className="mt-5 text-sm leading-7 text-white/65">
              Create your independent driver profile. Your application stays in the driver network
              and is reviewed separately from the public fleet.
            </p>
            <div className="mt-12 space-y-6 text-sm text-white/80">
              <p className="flex gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0 text-gold" />
                Secure document review
              </p>
              <p className="flex gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-gold" />
                Share your service location
              </p>
              <p className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-gold" />
                Track approval through your account
              </p>
            </div>
          </aside>
          <main className="p-6 sm:p-10">
            <h2 className="text-2xl font-bold">Driver registration</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tell us about you and the vehicle you operate.
            </p>
            <form onSubmit={onSubmit} className="mt-8 space-y-7">
              <section>
                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gold">
                  Account details
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ["fullName", "Full name", "text"],
                    ["email", "Email address", "email"],
                    ["phone", "Phone number", "tel"],
                    ["password", "Password", "password"],
                  ].map(([key, label, type]) => (
                    <label key={key} className="text-sm font-semibold">
                      {label}
                      <input
                        required
                        type={type}
                        value={String(form[key as keyof DriverRegistrationInput] || "")}
                        onChange={(e) => {
                          set(key as keyof DriverRegistrationInput, e.target.value);
                          clearError(key);
                        }}
                        className="mt-2 w-full rounded-xl border border-border px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-gold"
                      />
                      {errors[key] && <span className="mt-1 block text-xs font-normal text-red-600">{errors[key]}</span>}
                    </label>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gold">
                  Vehicle profile
                </h3>
                <div className="mb-4 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold">
                    Vehicle category
                    <select
                      required
                      value={form.vehicleCategory}
                      onChange={(e) => { set("vehicleCategory", e.target.value); clearError("vehicleCategory"); }}
                      className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-gold"
                    >
                      <option value="">Select category</option>
                      {["Car", "Van", "SUV", "Minivan", "Bus", "Three-wheeler", "Other"].map(
                        (category) => (
                          <option key={category}>{category}</option>
                        ),
                      )}
                    </select>
                    {errors.vehicleCategory && <span className="mt-1 block text-xs font-normal text-red-600">{errors.vehicleCategory}</span>}
                  </label>
                  <label className="text-sm font-semibold">
                    Vehicle name / model
                    <input
                      required
                      value={form.vehicleName}
                      onChange={(e) => { set("vehicleName", e.target.value); clearError("vehicleName"); }}
                      placeholder="Toyota Prius"
                      className="mt-2 w-full rounded-xl border border-border px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-gold"
                    />
                    {errors.vehicleName && <span className="mt-1 block text-xs font-normal text-red-600">{errors.vehicleName}</span>}
                  </label>
                  <label className="text-sm font-semibold">
                    Registration number
                    <input
                      required
                      value={form.vehicleRegistrationNumber}
                      onChange={(e) => { set("vehicleRegistrationNumber", e.target.value); clearError("vehicleRegistrationNumber"); }}
                      placeholder="CAB-1234"
                      className="mt-2 w-full rounded-xl border border-border px-4 py-3 font-normal uppercase outline-none focus:ring-2 focus:ring-gold"
                    />
                    {errors.vehicleRegistrationNumber && <span className="mt-1 block text-xs font-normal text-red-600">{errors.vehicleRegistrationNumber}</span>}
                  </label>
                  <label className="text-sm font-semibold">
                    Vehicle colour
                    <input
                      required
                      value={form.vehicleColour}
                      onChange={(e) => { set("vehicleColour", e.target.value); clearError("vehicleColour"); }}
                      placeholder="White"
                      className="mt-2 w-full rounded-xl border border-border px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-gold"
                    />
                    {errors.vehicleColour && <span className="mt-1 block text-xs font-normal text-red-600">{errors.vehicleColour}</span>}
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold">
                    Province
                    <select
                      required
                      value={form.province}
                      onChange={(e) => {
                        set("province", e.target.value);
                        set("district", "");
                        clearError("province");
                        clearError("district");
                      }}
                      className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-gold"
                    >
                      <option value="">Select province</option>
                      {Object.keys(districtsByProvince).map((province) => (
                        <option key={province}>{province}</option>
                      ))}
                    </select>
                    {errors.province && <span className="mt-1 block text-xs font-normal text-red-600">{errors.province}</span>}
                  </label>
                  <label className="text-sm font-semibold">
                    District
                    <select
                      required
                      disabled={!form.province}
                      value={form.district}
                      onChange={(e) => { set("district", e.target.value); clearError("district"); }}
                      className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-gold"
                    >
                      <option value="">Select district</option>
                      {(districtsByProvince[form.province] || []).map((district) => (
                        <option key={district}>{district}</option>
                      ))}
                    </select>
                    {errors.district && <span className="mt-1 block text-xs font-normal text-red-600">{errors.district}</span>}
                  </label>
                  <label className="text-sm font-semibold sm:col-span-2">
                    Operating location
                    <input
                      required
                      value={form.location}
                      onChange={(e) => { set("location", e.target.value); clearError("location"); }}
                      placeholder="Town, city, or service area"
                      className="mt-2 w-full rounded-xl border border-border px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-gold"
                    />
                    {errors.location && <span className="mt-1 block text-xs font-normal text-red-600">{errors.location}</span>}
                  </label>
                  <label className="text-sm font-semibold">
                    Seat capacity
                    <input
                      required
                      min="1"
                      type="number"
                      value={form.seatCapacity}
                      onChange={(e) => { set("seatCapacity", Number(e.target.value)); clearError("seatCapacity"); }}
                      className="mt-2 w-full rounded-xl border border-border px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-gold"
                    />
                    {errors.seatCapacity && <span className="mt-1 block text-xs font-normal text-red-600">{errors.seatCapacity}</span>}
                  </label>
                </div>
                <div className="mt-4 flex gap-3">
                  <label
                    className={`flex-1 rounded-xl border p-4 text-sm ${form.airConditioning === "ac" ? "border-gold bg-gold/10" : "border-border"}`}
                  >
                    <input
                      type="radio"
                      checked={form.airConditioning === "ac"}
                      onChange={() => set("airConditioning", "ac")}
                    />{" "}
                    <span className="ml-2 font-semibold">Air conditioned</span>
                  </label>
                  <label
                    className={`flex-1 rounded-xl border p-4 text-sm ${form.airConditioning === "non_ac" ? "border-gold bg-gold/10" : "border-border"}`}
                  >
                    <input
                      type="radio"
                      checked={form.airConditioning === "non_ac"}
                      onChange={() => set("airConditioning", "non_ac")}
                    />{" "}
                    <span className="ml-2 font-semibold">Non AC</span>
                  </label>
                </div>
              </section>
              <section>
                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gold">
                  Documents
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="flex cursor-pointer flex-col gap-2 rounded-2xl border border-dashed border-border p-5 text-sm">
                    <ImagePlus className="h-5 w-5 text-gold" />
                    <span className="font-semibold">Vehicle photos</span>
                    <span className="text-xs text-muted-foreground">Up to 5 images, 5 MB each</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      max={5}
                      className="text-xs"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        const total = form.vehiclePhotos.length + files.length;
                        if (total > 5) {
                          setMessage("Please select a maximum of 5 vehicle photos.");
                          e.currentTarget.value = "";
                          return;
                        }
                        const invalid = files.find((file) => !hasFileType(file, imageTypes) || file.size > maxPhotoSize);
                        if (invalid) {
                          setErrors((current) => ({ ...current, vehiclePhotos: `${invalid.name} must be a JPG, PNG, GIF, WEBP, or AVIF image under 5 MB.` }));
                          e.currentTarget.value = "";
                          return;
                        }
                        setMessage("");
                        clearError("vehiclePhotos");
                        set("vehiclePhotos", [...form.vehiclePhotos, ...files.map(fileName)]);
                        setVehiclePhotoFiles((current) => [...current, ...files]);
                        const previews = await Promise.all(files.map(readPreview));
                        setPhotoPreviews((current) => [...current, ...previews]);
                        e.currentTarget.value = "";
                      }}
                    />
                    {photoPreviews.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {photoPreviews.map((preview, index) => (
                          <div key={`${preview}-${index}`} className="group relative">
                            <img
                              src={preview}
                              alt={`Vehicle ${index + 1}`}
                              className="aspect-[4/3] w-full rounded-lg object-cover"
                            />
                            <button
                              type="button"
                              aria-label={`Remove vehicle photo ${index + 1}`}
                              onClick={() => {
                                set(
                                  "vehiclePhotos",
                                  form.vehiclePhotos.filter(
                                    (_, photoIndex) => photoIndex !== index,
                                  ),
                                );
                                setVehiclePhotoFiles((current) =>
                                  current.filter((_, photoIndex) => photoIndex !== index),
                                );
                                setPhotoPreviews((current) =>
                                  current.filter((_, previewIndex) => previewIndex !== index),
                                );
                              }}
                              className="absolute right-1 top-1 rounded-full bg-charcoal/85 p-1.5 text-white opacity-90 shadow transition hover:bg-red-600"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {errors.vehiclePhotos && <span className="text-xs font-normal text-red-600">{errors.vehiclePhotos}</span>}
                  </label>
                  <label className="flex cursor-pointer flex-col gap-2 rounded-2xl border border-dashed border-border p-5 text-sm">
                    <FileText className="h-5 w-5 text-gold" />
                    <span className="font-semibold">Driver document</span>
                    <span className="text-xs text-muted-foreground">NIC or licence, maximum 10 MB</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="text-xs"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file && (!hasFileType(file, documentTypes) || file.size > maxDocumentSize)) {
                          setErrors((current) => ({ ...current, driverDocument: `${file.name} must be an image or PDF under 10 MB.` }));
                          e.currentTarget.value = "";
                          return;
                        }
                        set("driverDocument", fileName(file));
                        setDriverDocumentFile(file);
                        clearError("driverDocument");
                        if (file) {
                          const preview = await readPreview(file);
                          setDocumentPreviews((current) => ({ ...current, driver: preview }));
                        }
                      }}
                    />
                    {documentPreviews.driver &&
                      (documentPreviews.driver.startsWith("data:image/") ? (
                        <img
                          src={documentPreviews.driver}
                          alt="Driver document preview"
                          className="max-h-28 rounded-lg object-contain"
                        />
                      ) : (
                        <iframe
                          title="Driver document preview"
                          src={documentPreviews.driver}
                          className="h-28 w-full rounded-lg border"
                        />
                      ))}
                    {errors.driverDocument && <span className="text-xs font-normal text-red-600">{errors.driverDocument}</span>}
                  </label>
                  <label className="flex cursor-pointer flex-col gap-2 rounded-2xl border border-dashed border-border p-5 text-sm">
                    <FileText className="h-5 w-5 text-gold" />
                    <span className="font-semibold">Insurance</span>
                    <span className="text-xs text-muted-foreground">Valid insurance proof, maximum 10 MB</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="text-xs"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file && (!hasFileType(file, documentTypes) || file.size > maxDocumentSize)) {
                          setErrors((current) => ({ ...current, insuranceDocument: `${file.name} must be an image or PDF under 10 MB.` }));
                          e.currentTarget.value = "";
                          return;
                        }
                        set("insuranceDocument", fileName(file));
                        setInsuranceDocumentFile(file);
                        clearError("insuranceDocument");
                        if (file) {
                          const preview = await readPreview(file);
                          setDocumentPreviews((current) => ({ ...current, insurance: preview }));
                        }
                      }}
                    />
                    {documentPreviews.insurance &&
                      (documentPreviews.insurance.startsWith("data:image/") ? (
                        <img
                          src={documentPreviews.insurance}
                          alt="Insurance document preview"
                          className="max-h-28 rounded-lg object-contain"
                        />
                      ) : (
                        <iframe
                          title="Insurance document preview"
                          src={documentPreviews.insurance}
                          className="h-28 w-full rounded-lg border"
                        />
                      ))}
                    {errors.insuranceDocument && <span className="text-xs font-normal text-red-600">{errors.insuranceDocument}</span>}
                  </label>
                </div>
              </section>
              {message && (
                <p className="rounded-xl bg-gold/15 px-4 py-3 text-sm font-semibold">{message}</p>
              )}
              <button
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-charcoal px-5 py-4 font-bold text-white hover:bg-charcoal/90 disabled:opacity-60"
              >
                {saving ? "Submitting..." : "Submit application"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}
