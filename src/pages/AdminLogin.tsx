import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, Loader2, Mail } from "lucide-react";
import { adminLogin, isAdminAuthed } from "@/lib/admin-store";

const logo = "/assets/logo.jpg";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdminAuthed()) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await adminLogin(email, password);
    setLoading(false);
    if (result.ok) {
      navigate("/admin");
    } else {
      setError(result.message ?? "Invalid email or password.");
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-charcoal flex items-center justify-center p-4">

      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/3" />
        <div className="absolute top-1/2 left-1/2 h-100 w-100 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/3" />
      </div>

      <Link
        to="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to site
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm"
      >
        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/4 shadow-2xl backdrop-blur-xl">

          {/* Gold accent line */}
          <div className="h-px bg-linear-to-r from-transparent via-gold/60 to-transparent" />

          <div className="px-8 py-10">
            {/* Logo */}
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gold/20 blur-md" />
                <img
                  src={logo}
                  alt="Agra Taxis"
                  className="relative h-16 w-16 rounded-xl object-cover ring-1 ring-white/20"
                />
              </div>
              <h1 className="mt-5 text-xl font-bold tracking-tight text-white">
                Admin Portal
              </h1>
              <p className="mt-1 text-sm text-white/40">Agra Taxis Fleet Management</p>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-white/40">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-gold/50 focus:bg-white/8 focus:ring-1 focus:ring-gold/30 disabled:opacity-50"
                    placeholder="admin@agrataxis.com"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-white/40">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-gold/50 focus:bg-white/8 focus:ring-1 focus:ring-gold/30 disabled:opacity-50"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="relative mt-2 w-full overflow-hidden rounded-xl bg-gold py-3.5 text-sm font-bold text-charcoal shadow-gold transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="relative inline-flex items-center justify-center gap-2">
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
                  ) : (
                    <>Sign In to Dashboard</>
                  )}
                </span>
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-white/5 px-8 py-4 text-center text-xs text-white/20">
            Agra Taxis © {new Date().getFullYear()} · Secured admin access
          </div>
        </div>
      </motion.div>
    </div>
  );
}
