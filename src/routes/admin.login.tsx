import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowLeft } from "lucide-react";
import { adminLogin, isAdminAuthed } from "@/lib/admin-store";

const logo = "/assets/logo.jpg";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [{ title: "Admin Login — Agra Taxis" }, { name: "robots", content: "noindex" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (typeof window !== "undefined" && isAdminAuthed()) {
    navigate({ to: "/admin" });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (adminLogin(email, password)) {
      navigate({ to: "/admin" });
    } else {
      setError("Invalid email or password");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/15 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />

      <Link to="/" className="absolute top-6 left-6 inline-flex items-center gap-2 text-white/70 hover:text-white text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to site
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-card rounded-3xl shadow-card p-8 sm:p-10"
      >
        <div className="flex flex-col items-center text-center">
          <img src={logo} alt="Agra Taxis" className="w-16 h-16 rounded-full" />
          <h1 className="mt-4 text-2xl font-bold text-charcoal">Admin Panel</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to manage bookings</p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="block text-sm font-medium text-charcoal mb-2">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="admin"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-charcoal mb-2">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="••••••••"
            />
          </label>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</div>
          )}

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-gold text-gold-foreground font-semibold py-3.5 rounded-xl shadow-gold hover:scale-[1.02] transition-transform"
          >
            <Lock className="w-4 h-4" /> Sign In
          </button>
        </form>

        <p className="mt-6 text-xs text-center text-muted-foreground">
          Demo password: <code className="font-mono">agra2026</code>
        </p>
      </motion.div>
    </div>
  );
}
