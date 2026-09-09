import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { changeDriverPassword, loginDriver, sendDriverPasswordReset } from "@/lib/driver-portal";

type Mode = "login" | "forgot" | "change";

export default function DriverLogin() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      if (mode === "login") {
        await loginDriver(email, password);
        navigate("/drivers/account");
        return;
      }
      else if (mode === "forgot") await sendDriverPasswordReset(email);
      else await changeDriverPassword(token, password);
      setMessage(mode === "login" ? "Signed in successfully." : mode === "forgot" ? "If the email exists, a reset link has been sent." : "Password changed successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Request failed.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl sm:p-10">
        <Link to="/drivers/register" className="text-sm font-semibold text-gold">&larr; Back to registration</Link>
        <h1 className="mt-8 text-3xl font-bold">Driver account</h1>
        <p className="mt-2 text-sm text-muted-foreground">Use your email to access your account.</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          {mode === "change" && <input required placeholder="Reset token" value={token} onChange={(event) => setToken(event.target.value)} className="w-full rounded-xl border px-4 py-3" />}
          <input required type="email" placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border px-4 py-3" />
          {mode !== "forgot" && <input required type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border px-4 py-3" />}
          {message && <p className="rounded-xl bg-gold/15 px-4 py-3 text-sm">{message}</p>}
          <button className="w-full rounded-xl bg-charcoal px-4 py-3 font-bold text-white">{mode === "login" ? "Sign in" : mode === "forgot" ? "Email reset link" : "Change password"}</button>
        </form>
        <div className="mt-6 flex justify-between text-xs font-semibold">
          <button type="button" onClick={() => setMode(mode === "login" ? "forgot" : "login")} className="text-gold">{mode === "login" ? "Forgot password?" : "Sign in"}</button>
          <button type="button" onClick={() => setMode("change")} className="text-muted-foreground">Change password</button>
        </div>
      </div>
    </div>
  );
}
