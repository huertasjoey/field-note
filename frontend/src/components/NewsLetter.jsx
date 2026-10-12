import { useState } from "react";
import { api } from "../lib/api";
import { EMAIL_RE } from "../lib/format";

function NewsLetter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" }); // idle | loading | success | error

  async function handleSubmit(e) {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setStatus({ type: "error", message: "Please enter a valid email address." });
      return;
    }
    setStatus({ type: "loading", message: "" });
    try {
      const res = await api.subscribe(value);
      setStatus({ type: "success", message: res.message });
      setEmail("");
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  return (
    <section id="newsletter" aria-labelledby="newsletter-heading" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
      <div className="rounded-3xl bg-brand px-6 py-14 text-center text-white sm:px-12">
        <h2 id="newsletter-heading" className="font-serif text-3xl font-bold sm:text-4xl">
          A letter worth opening
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-violet-100">
          One thoughtful email now and then: new stories, places to wander and ideas to chew on. No spam, unsubscribe any time.
        </p>
        <form onSubmit={handleSubmit} noValidate className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={status.type === "error"}
            aria-describedby="newsletter-status"
            className="min-w-0 flex-1 rounded-full border border-transparent bg-white px-5 py-3 text-ink placeholder:text-stone-400"
          />
          <button
            type="submit"
            disabled={status.type === "loading"}
            className="rounded-full bg-rose-400 px-6 py-3 font-medium text-white transition-colors hover:bg-rose-500 disabled:opacity-60"
          >
            {status.type === "loading" ? "Subscribing…" : "Subscribe"}
          </button>
        </form>
        <p
          id="newsletter-status"
          role="status"
          className={`mt-4 min-h-6 text-sm ${status.type === "error" ? "text-rose-200" : "text-emerald-200"}`}
        >
          {status.message}
        </p>
      </div>
    </section>
  );
}

export default NewsLetter;
