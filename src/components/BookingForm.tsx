import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/contact";
import { saveBooking } from "@/lib/admin-store";

const vehicles = ["Car (Sedan)", "KDH Van", "SUV", "Luxury Car", "Mini Bus", "Tourist Coach"];

export function BookingForm() {
  const [form, setForm] = useState({
    vehicle: vehicles[0],
    pickup: "",
    destination: "",
    date: "",
    days: "1",
    trip: "One Way",
    pax: "1",
    ac: "AC",
  });

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    try { saveBooking(form); } catch {}
    const msg = `ආයුබෝවන් 🙏 අග්‍රා ටැක්සි වෙත සාදරයෙන් පිලිගනිමු

*New Booking Inquiry*
🚗 අවශ්‍ය වාහනය / Vehicle: ${form.vehicle}
📍 ආරම්භ ස්ථානය / Pickup: ${form.pickup}
🎯 ගමන් කරන ප්‍රදේශය / Destination: ${form.destination}
📅 දිනය / Date: ${form.date}
🗓️ දින ගණන / Days: ${form.days}
🔁 යාමට හා ඒමටද / Trip: ${form.trip}
👥 මගීන් ගණන / Passengers: ${form.pax}
❄️ AC / Non AC: ${form.ac}

ස්තූතියි!`;
    window.open(waLink(msg), "_blank");
  }

  const inputCls =
    "w-full px-4 py-3 bg-background border border-border rounded-xl text-charcoal focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all";

  return (
    <section id="booking" className="py-20 lg:py-28 bg-gradient-dark relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="text-gold font-semibold uppercase tracking-wider text-sm">Booking Inquiry</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-balance">
            Reserve Your Vehicle in Seconds
          </h2>
          <p className="mt-4 text-white/70 text-lg font-sinhala">
            ආයුබෝවන් 🙏 අග්‍රා ටැක්සි වෙත සාදරයෙන් පිලිගනිමු
          </p>
        </motion.div>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-10 bg-card rounded-3xl p-6 sm:p-8 lg:p-10 shadow-card"
        >
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="අවශ්‍ය වාහනය / Required Vehicle">
              <select required value={form.vehicle} onChange={(e) => update("vehicle", e.target.value)} className={inputCls}>
                {vehicles.map((v) => <option key={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="මගීන් ගණන / Passenger Count">
              <input required type="number" min={1} max={60} value={form.pax} onChange={(e) => update("pax", e.target.value)} className={inputCls} />
            </Field>
            <Field label="ආරම්භ ස්ථානය / Pickup Location">
              <input required type="text" placeholder="e.g. Colombo" value={form.pickup} onChange={(e) => update("pickup", e.target.value)} className={inputCls} />
            </Field>
            <Field label="ගමන් කරන ප්‍රදේශය / Destination">
              <input required type="text" placeholder="e.g. Kandy" value={form.destination} onChange={(e) => update("destination", e.target.value)} className={inputCls} />
            </Field>
            <Field label="දිනය / Date">
              <input required type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className={inputCls} />
            </Field>
            <Field label="දින ගණන / Number of Days">
              <input required type="number" min={1} value={form.days} onChange={(e) => update("days", e.target.value)} className={inputCls} />
            </Field>
            <Field label="යාමට හා ඒමටද / Trip Type">
              <select value={form.trip} onChange={(e) => update("trip", e.target.value)} className={inputCls}>
                <option>One Way</option>
                <option>Round Trip</option>
              </select>
            </Field>
            <Field label="AC / Non AC">
              <select value={form.ac} onChange={(e) => update("ac", e.target.value)} className={inputCls}>
                <option>AC</option>
                <option>Non AC</option>
              </select>
            </Field>
          </div>

          <button
            type="submit"
            className="mt-7 w-full inline-flex items-center justify-center gap-2 bg-whatsapp hover:bg-whatsapp/90 text-white font-semibold py-4 rounded-xl shadow-card hover:shadow-gold transition-all text-base"
          >
            <MessageCircle className="w-5 h-5" />
            Send Inquiry on WhatsApp
          </button>
        </motion.form>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-charcoal mb-2">{label}</span>
      {children}
    </label>
  );
}
