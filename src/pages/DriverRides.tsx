import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_BASE } from "@/lib/api";
import {
  deleteDriverRide,
  getAllDriverRides,
  getDriverRegistrations,
  getDriverRides,
  saveDriverRide,
  type DriverRegistration,
  type DriverRide,
  type DriverRideInput,
} from "@/lib/driver-portal";

const empty: DriverRideInput = {
  rideDate: new Date().toISOString().slice(0, 10),
  customerName: "",
  customerPhone: "",
  pickup: "",
  destination: "",
  tripType: "One Way",
  distanceKm: 0,
  rideAmount: 0,
  driverPayment: 0,
  otherCharges: 0,
  paymentStatus: "unpaid",
  paymentMethod: "",
  notes: "",
};
const proofUrl = (file: string) =>
  file.startsWith("http") ? file : `${API_BASE.replace(/\/api$/, "")}/storage/app/public/${file}`;
const moneyFields = ["distanceKm", "rideAmount", "driverPayment", "otherCharges"];
const rideFields = [
  ["rideDate", "Ride date"],
  ["customerName", "Customer name"],
  ["customerPhone", "Customer phone"],
  ["pickup", "Pickup"],
  ["destination", "Destination"],
  ["tripType", "Trip type"],
  ["distanceKm", "Distance (km)"],
  ["rideAmount", "Ride amount"],
  ["driverPayment", "Driver payment"],
  ["otherCharges", "Other charges"],
  ["paymentMethod", "Payment method"],
] as const;

export default function DriverRides() {
  const { driverId } = useParams();
  const [drivers, setDrivers] = useState<DriverRegistration[]>([]);
  const [rides, setRides] = useState<DriverRide[]>([]);
  const [selectedDriver, setSelectedDriver] = useState(driverId || "");
  const [form, setForm] = useState<DriverRideInput>({ ...empty });
  const [editing, setEditing] = useState<string>();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [message, setMessage] = useState("");
  useEffect(() => {
    void Promise.all([
      getDriverRegistrations(),
      driverId ? getDriverRides(driverId) : getAllDriverRides(),
    ])
      .then(([driverRows, rideRows]) => {
        setDrivers(driverRows);
        setRides(rideRows);
      })
      .catch((error) => setMessage(error.message));
  }, [driverId]);
  const visibleRides = rides.filter(
    (ride) =>
      (!selectedDriver || ride.driverId === selectedDriver) &&
      (paymentFilter === "all" || ride.paymentStatus === paymentFilter) &&
      (!search.trim() ||
        `${ride.customerName} ${ride.customerPhone} ${ride.pickup} ${ride.destination}`
          .toLowerCase()
          .includes(search.trim().toLowerCase())),
  );
  const set = (key: keyof DriverRideInput, value: string | number | File) =>
    setForm((current) => ({ ...current, [key]: value }));
  const resetForm = () => {
    setEditing(undefined);
    setForm({ ...empty });
    setShowForm(false);
  };
  async function submit(event: FormEvent) {
    event.preventDefault();
    const ownerId = editing ? rides.find((ride) => ride.id === editing)?.driverId : selectedDriver;
    if (!ownerId) {
      setMessage("Select a driver before adding a ride.");
      return;
    }
    try {
      const saved = await saveDriverRide(ownerId, form, editing);
      setRides((current) =>
        editing
          ? current.map((ride) => (ride.id === saved.id ? saved : ride))
          : [saved, ...current],
      );
      resetForm();
      setMessage("Ride saved successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save ride.");
    }
  }
  async function removeRide(ride: DriverRide) {
    if (!window.confirm("Delete this ride permanently?")) return;
    try {
      await deleteDriverRide(ride.driverId || "", ride.id);
      setRides((current) => current.filter((item) => item.id !== ride.id));
      setMessage("Ride deleted successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete ride.");
    }
  }
  return (
    <div className="min-h-screen bg-[#f7f5ef] px-4 py-8 text-charcoal sm:px-8">
      <div className="mx-auto max-w-7xl">
        <Link to="/admin/drivers" className="text-sm font-semibold">
          &larr; Back to drivers
        </Link>
        <div className="mb-7 mt-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gold">
              Independent driver network
            </p>
            <h1 className="mt-2 text-3xl font-bold">All rides and payment history</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Showcase of every ride, fare breakdown, and payment proof.
            </p>
          </div>
          <Link
            to="/admin/drivers"
            className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-bold"
          >
            Driver applications
          </Link>
        </div>
        <div className="mb-5 grid gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm md:grid-cols-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer or route..."
            className="rounded-xl border border-border px-3 py-2.5 text-sm"
          />
          <select
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            className="rounded-xl border border-border px-3 py-2.5 text-sm"
          >
            <option value="">All drivers</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.fullName} - {driver.email}
              </option>
            ))}
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="rounded-xl border border-border px-3 py-2.5 text-sm"
          >
            <option value="all">All payment statuses</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
          <div className="rounded-xl bg-[#f7f5ef] px-3 py-2.5 text-sm font-semibold">
            Showing {visibleRides.length} of {rides.length} rides
          </div>
        </div>
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setEditing(undefined);
              setForm({ ...empty });
              setShowForm((current) => !current);
            }}
            className="rounded-xl bg-charcoal px-5 py-3 text-sm font-bold text-white"
          >
            {showForm ? "Close add ride" : "Add ride"}
          </button>
        </div>
        {showForm && (
          <form onSubmit={submit} className="mb-8 rounded-2xl bg-white p-6 shadow-soft">
            <h2 className="mb-4 text-xl font-bold">{editing ? "Edit ride" : "Add ride"}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-sm font-semibold">
                Driver
                <select
                  required={!editing}
                  disabled={Boolean(editing)}
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 font-normal"
                >
                  <option value="">Select driver</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.fullName}
                    </option>
                  ))}
                </select>
              </label>
              {rideFields.map(([key, label]) => (
                <label key={key} className="text-sm font-semibold">
                  {label}
                  <input
                    required={!["customerPhone", "distanceKm", "paymentMethod"].includes(key)}
                    type={
                      key === "rideDate" ? "date" : moneyFields.includes(key) ? "number" : "text"
                    }
                    step="0.01"
                    value={String(form[key])}
                    onChange={(e) =>
                      set(key, moneyFields.includes(key) ? Number(e.target.value) : e.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-border px-3 py-2 font-normal"
                  />
                </label>
              ))}
              <label className="text-sm font-semibold">
                Payment status
                <select
                  value={form.paymentStatus}
                  onChange={(e) => set("paymentStatus", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 font-normal"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
              </label>
              <label className="text-sm font-semibold">
                Payment proof
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) set("paymentProofFile", file);
                  }}
                  className="mt-1 w-full text-xs font-normal"
                />
              </label>
              <label className="text-sm font-semibold sm:col-span-2 lg:col-span-4">
                Notes
                <textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2 font-normal"
                />
              </label>
            </div>
            {message && <p className="mt-4 rounded-xl bg-gold/15 px-4 py-3 text-sm">{message}</p>}
            <button className="mt-5 rounded-xl bg-charcoal px-5 py-3 font-bold text-white">
              {editing ? "Update ride" : "Add ride"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="ml-2 rounded-xl border px-5 py-3 font-semibold"
            >
              Cancel
            </button>
          </form>
        )}
        <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-soft">
          <table className="min-w-[1400px] w-full text-left text-sm">
            <thead className="bg-charcoal text-xs uppercase tracking-wider text-white/75">
              <tr>
                {[
                  "Driver",
                  "Date",
                  "Customer",
                  "Route",
                  "Trip",
                  "Payment breakdown",
                  "Status",
                  "Proof",
                  "Action",
                ].map((heading) => (
                  <th key={heading} className="px-4 py-4">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibleRides.map((ride) => (
                <tr key={ride.id} className="align-top">
                  <td className="px-4 py-4 font-semibold">
                    {drivers.find((driver) => driver.id === ride.driverId)?.fullName ||
                      (ride.driverId ? `Driver #${ride.driverId}` : "Deleted user")}
                  </td>
                  <td className="px-4 py-4">{ride.rideDate}</td>
                  <td className="px-4 py-4 font-semibold">
                    {ride.customerName}
                    <br />
                    <span className="font-normal text-muted-foreground">{ride.customerPhone}</span>
                  </td>
                  <td className="px-4 py-4">
                    {ride.pickup}
                    <br />
                    to {ride.destination}
                  </td>
                  <td className="px-4 py-4">
                    {ride.tripType}
                    <br />
                    {ride.distanceKm} km
                  </td>
                  <td className="px-4 py-4">
                    Ride: {ride.rideAmount.toFixed(2)}
                    <br />
                    Driver: {ride.driverPayment.toFixed(2)}
                    <br />
                    Other: {ride.otherCharges.toFixed(2)}
                    <br />
                    <b>Total: {ride.totalAmount.toFixed(2)}</b>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-bold capitalize">{ride.paymentStatus}</span>
                    <br />
                    {ride.paymentMethod}
                  </td>
                  <td className="px-4 py-4">
                    {ride.paymentProof ? (
                      <a
                        className="text-gold underline"
                        target="_blank"
                        rel="noreferrer"
                        href={proofUrl(ride.paymentProof)}
                      >
                        View proof
                      </a>
                    ) : (
                      "None"
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(ride.id);
                        setSelectedDriver(ride.driverId || "");
                        setForm({ ...ride, paymentProofFile: undefined });
                        setShowForm(true);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="rounded-lg border px-3 py-2 text-xs font-bold"
                    >
                      Edit
                    </button>
                    <button
                        type="button"
                        onClick={() => void removeRide(ride)}
                        className="ml-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600"
                      >
                        Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibleRides.length === 0 && (
            <p className="p-8 text-center text-muted-foreground">
              No rides match the selected filters.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
