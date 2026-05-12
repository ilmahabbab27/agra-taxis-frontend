import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LogOut, Search, Trash2, Phone, MessageCircle, Calendar, Users, MapPin,
  Inbox, CheckCircle2, Clock, XCircle,
} from "lucide-react";
import logo from "@/assets/logo.jpg";
import {
  type Booking, getBookings, isAdminAuthed, adminLogout,
  updateBookingStatus, deleteBooking,
} from "@/lib/admin-store";
import { waLink, PHONE } from "@/lib/contact";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Admin Dashboard — Agra Taxis" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminDashboard,
});

const statusColors: Record<Booking["status"], string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | Booking["status"]>("all");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAdminAuthed()) {
      navigate({ to: "/admin/login" });
      return;
    }
    setBookings(getBookings());
    setReady(true);
  }, [navigate]);

  function refresh() { setBookings(getBookings()); }

  function onLogout() {
    adminLogout();
    navigate({ to: "/admin/login" });
  }

  const stats = useMemo(() => ({
    total: bookings.length,
    new: bookings.filter((b) => b.status === "new").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  }), [bookings]);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (filter !== "all" && b.status !== filter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return [b.vehicle, b.pickup, b.destination, b.pax].some((v) => v.toLowerCase().includes(q));
    });
  }, [bookings, query, filter]);

  if (!ready) return null;

  const statCards = [
    { label: "Total", value: stats.total, icon: Inbox, color: "text-charcoal" },
    { label: "New", value: stats.new, icon: Clock, color: "text-blue-600" },
    { label: "Confirmed", value: stats.confirmed, icon: CheckCircle2, color: "text-emerald-600" },
    { label: "Cancelled", value: stats.cancelled, icon: XCircle, color: "text-red-600" },
  ];

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="bg-charcoal text-white sticky top-0 z-30 shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Agra Taxis" className="w-9 h-9 rounded-full" />
            <div>
              <div className="font-display font-bold leading-tight">Agra Taxis</div>
              <div className="text-[10px] uppercase tracking-wider text-gold">Admin</div>
            </div>
          </Link>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">Booking Inquiries</h1>
          <p className="text-muted-foreground text-sm mt-1">All inquiries submitted from the website.</p>
        </div>

        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl p-5 shadow-soft border border-border"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">{s.label}</span>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className="mt-2 text-3xl font-bold text-charcoal">{s.value}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by vehicle, location..."
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            {(["all", "new", "contacted", "confirmed", "cancelled"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold capitalize transition-all ${
                  filter === f ? "bg-charcoal text-white" : "bg-card text-charcoal hover:bg-accent"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {filtered.length === 0 && (
            <div className="bg-card rounded-2xl p-12 text-center border border-border shadow-soft">
              <Inbox className="w-10 h-10 mx-auto text-muted-foreground" />
              <p className="mt-3 font-medium text-charcoal">No bookings yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Inquiries submitted from the website will appear here.
              </p>
            </div>
          )}

          {filtered.map((b) => (
            <motion.div
              key={b.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-5 shadow-soft border border-border hover:shadow-card transition-shadow"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-charcoal">{b.vehicle}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[b.status]}`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(b.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={waLink(`Hello, regarding your booking inquiry for ${b.vehicle} from ${b.pickup} to ${b.destination} on ${b.date}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-whatsapp text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                  <a
                    href={`tel:${PHONE}`}
                    className="inline-flex items-center gap-1.5 bg-secondary text-charcoal px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-accent"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call
                  </a>
                </div>
              </div>

              <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <Detail icon={MapPin} label="Pickup" value={b.pickup} />
                <Detail icon={MapPin} label="Destination" value={b.destination} />
                <Detail icon={Calendar} label="Date" value={`${b.date} (${b.days} day${b.days === "1" ? "" : "s"})`} />
                <Detail icon={Users} label="Passengers" value={`${b.pax} • ${b.ac} • ${b.trip}`} />
              </div>

              <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground mr-1">Status:</span>
                {(["new", "contacted", "confirmed", "cancelled"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => { updateBookingStatus(b.id, s); refresh(); }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition-all ${
                      b.status === s ? statusColors[s] + " ring-1 ring-current" : "bg-secondary text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {s}
                  </button>
                ))}
                <button
                  onClick={() => {
                    if (confirm("Delete this booking?")) { deleteBooking(b.id); refresh(); }
                  }}
                  className="ml-auto inline-flex items-center gap-1 text-xs text-red-600 hover:bg-red-50 px-2.5 py-1 rounded-md"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}

function Detail({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <div className="mt-1 text-charcoal font-medium break-words">{value}</div>
    </div>
  );
}
