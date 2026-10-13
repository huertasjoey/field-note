import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { inputClass } from "../components/formStyles";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Mirrors the server's rules; the server is the authority.
const rules = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "Upper and lower case letters", test: (p) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { label: "A number", test: (p) => /\d/.test(p) },
];

function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => navigate("/", { replace: true }), 1500);
    return () => clearTimeout(timer);
  }, [done, navigate]);

  if (user && !done) return <Navigate to="/" replace />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = "Enter your name.";
    if (!EMAIL_RE.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (!rules.every((r) => r.test(form.password))) next.password = "Password does not meet the requirements below.";
    if (form.confirm !== form.password) next.confirm = "Passwords do not match.";
    setErrors(next);
    setServerError("");
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      setDone(true);
    } catch (err) {
      setServerError(err.message);
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md px-4 py-14 text-center sm:px-6">
        <h1 className="font-serif text-3xl font-bold">Welcome to Fieldnote</h1>
        <p role="status" className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Your account was created. Taking you to the homepage…
        </p>
      </div>
    );
  }

  const field = (id, label, type, auto) => (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={auto}
        value={form[id]}
        onChange={set(id)}
        aria-invalid={!!errors[id]}
        aria-describedby={errors[id] ? `${id}-err` : undefined}
        className={inputClass}
      />
      {errors[id] && (
        <p id={`${id}-err`} className="mt-1 text-sm text-accent">
          {errors[id]}
        </p>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <h1 className="font-serif text-3xl font-bold">Create an account</h1>
      <p className="mt-2 text-sm text-muted">Join Fieldnote to keep up with new stories.</p>

      {serverError && (
        <p role="alert" className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-accent">
          {serverError}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        {field("name", "Full name", "text", "name")}
        {field("email", "Email", "email", "email")}
        <div>
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              value={form.password}
              onChange={set("password")}
              aria-invalid={!!errors.password}
              aria-describedby="password-rules"
              className={`${inputClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 mt-1 flex items-center px-3 text-muted hover:text-ink"
            >
              {show ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-sm text-accent">{errors.password}</p>}
          <ul id="password-rules" className="mt-2 space-y-0.5 text-xs">
            {rules.map((r) => (
              <li key={r.label} className={r.test(form.password) ? "text-emerald-700" : "text-muted"}>
                {r.test(form.password) ? "✓" : "○"} {r.label}
              </li>
            ))}
          </ul>
        </div>
        {field("confirm", "Confirm password", show ? "text" : "password", "new-password")}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-brand px-5 py-3 font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-brand hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default Register;
