import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, Loader2 } from "lucide-react";
import { adminLogin, isAdminAuthed } from "@/lib/admin-store";

const logo = "/assets/logo.jpg";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [{ title: "Admin Login - Agra Taxis" }, { name: "robots", content: "noindex" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (typeof window !== "undefined" && isAdminAuthed()) {
    navigate({ to: "/admin" });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await adminLogin(email, password);

    setLoading(false);

    if (result.ok) {
      navigate({ to: "/admin" });
    } else {
      setError(result.message ?? "Invalid email or password.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4 relative overflow-hidden">
      <Link to="/" className="absolute top-6 left-6 inline-flex items-center gap-2 text-white/70 hover:text-white text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to site
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-card rounded-lg shadow-card p-8 sm:p-10 border border-border"
      >
        <div className="flex flex-col items-center text-center">
          <img src={logo} alt="Agra Taxis" className="w-16 h-16 rounded-md object-cover" />
          <h1 className="mt-4 text-2xl font-semibold text-charcoal">Admin Panel</h1>
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
              className="w-full px-4 py-3 bg-background border border-border rounded-md text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="admin@agrataxis.com"
              disabled={loading}
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-charcoal mb-2">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-md text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="Password"
              disabled={loading}
            />
          </label>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-gold text-gold-foreground font-semibold py-3.5 rounded-md hover:bg-gold/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
            ) : (
              <><Lock className="w-4 h-4" /> Sign In</>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
