import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  clearDriverToken,
  getDriverAccount,
  updateDriverAccount,
  type DriverRegistration,
} from "@/lib/driver-portal";
import { districtsByProvince, provinces } from "@/lib/sri-lanka-locations";

const fields = [
  ["fullName", "Full name"], ["email", "Email address"], ["phone", "Phone"],
  ["location", "Location"],
  ["vehicleCategory", "Vehicle category"], ["vehicleName", "Vehicle name"],
  ["vehicleRegistrationNumber", "Registration number"], ["vehicleColour", "Vehicle colour"],
] as const;

export default function DriverAccount() {
  const navigate = useNavigate();
  const [driver, setDriver] = useState<DriverRegistration | null>(null);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void getDriverAccount().then(setDriver).catch((error) => setMessage(error.message)).finally(() => setLoading(false));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!driver) return;
    setSaving(true);
    setMessage("");
    try {
      setDriver(await updateDriverAccount(driver, password));
      setPassword("");
      setMessage("Account details updated successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update account.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading account...</div>;
  if (!driver) return <div className="mx-auto max-w-lg p-8 text-center text-red-600">{message || "Account unavailable."}</div>;

  return (
    <div className="min-h-screen bg-[#f7f5ef] px-4 py-8 text-charcoal sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div><Link to="/" className="font-display text-xl font-bold">Agra <span className="text-gold">Taxis</span></Link><p className="mt-2 text-sm text-muted-foreground">Driver account</p></div>
          <button type="button" onClick={() => { clearDriverToken(); navigate("/drivers/login"); }} className="text-sm font-semibold">Sign out</button>
        </div>
        <form onSubmit={submit} className="rounded-3xl bg-white p-6 shadow-xl sm:p-10">
          <div className="mb-8"><h1 className="text-3xl font-bold">Your account details</h1><p className="mt-2 text-sm text-muted-foreground">Update your contact and vehicle information.</p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">Province<select required value={driver.province} onChange={(event) => setDriver({ ...driver, province: event.target.value, district: "" })} className="mt-1 w-full rounded-xl border border-border px-3 py-2 font-normal"><option value="">Select province</option>{provinces.map((province) => <option key={province} value={province}>{province}</option>)}</select></label>
            <label className="text-sm font-semibold">District<select required value={driver.district} onChange={(event) => setDriver({ ...driver, district: event.target.value })} className="mt-1 w-full rounded-xl border border-border px-3 py-2 font-normal"><option value="">Select district</option>{(districtsByProvince[driver.province] || []).map((district) => <option key={district} value={district}>{district}</option>)}</select></label>
            {fields.map(([key, label]) => (
              <label key={key} className="text-sm font-semibold">{label}<input required value={String(driver[key])} onChange={(event) => setDriver({ ...driver, [key]: event.target.value })} className="mt-1 w-full rounded-xl border border-border px-3 py-2 font-normal" /></label>
            ))}
            <label className="text-sm font-semibold">Seat capacity<input required type="number" min="1" value={driver.seatCapacity} onChange={(event) => setDriver({ ...driver, seatCapacity: Number(event.target.value) })} className="mt-1 w-full rounded-xl border border-border px-3 py-2 font-normal" /></label>
            <label className="text-sm font-semibold">AC status<select value={driver.airConditioning} onChange={(event) => setDriver({ ...driver, airConditioning: event.target.value as DriverRegistration["airConditioning"] })} className="mt-1 w-full rounded-xl border border-border px-3 py-2 font-normal"><option value="ac">AC</option><option value="non_ac">Non AC</option></select></label>
            <label className="text-sm font-semibold sm:col-span-2">New password (optional)<input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Leave blank to keep current password" className="mt-1 w-full rounded-xl border border-border px-3 py-2 font-normal" /></label>
          </div>
          {message && <p className="mt-5 rounded-xl bg-gold/15 px-4 py-3 text-sm">{message}</p>}
          <button disabled={saving} className="mt-6 rounded-xl bg-charcoal px-5 py-3 font-bold text-white disabled:opacity-60">{saving ? "Saving..." : "Save changes"}</button>
        </form>
      </div>
    </div>
  );
}
