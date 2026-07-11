"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "duplicate" | "error";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    // The honeypot input is invisible to humans; bots that fill it get a
    // fake success and no Kit call (handled server-side).
    const honeypot =
      (e.currentTarget.elements.namedItem("website") as HTMLInputElement)
        ?.value ?? "";
    try {
      // Trailing slash matters: trailingSlash:true 308s the bare path.
      const res = await fetch("/api/subscribe/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website: honeypot }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(data.status === "duplicate" ? "duplicate" : "success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="rounded-lg bg-neutral-100 p-6 text-center dark:bg-neutral-900">
        Thanks for subscribing! Check your inbox to confirm.
      </p>
    );
  }
  if (status === "duplicate") {
    return (
      <p className="rounded-lg bg-neutral-100 p-6 text-center dark:bg-neutral-900">
        You&apos;re already subscribed — nothing to do.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg bg-neutral-100 p-6 dark:bg-neutral-900"
    >
      <h2 className="font-semibold">Subscribe to the newsletter</h2>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Python, APIs, and AI automation for finance teams. No spam.
      </p>
      <div className="mt-4 flex gap-2">
        <label htmlFor="subscribe-email" className="sr-only">
          Email address
        </label>
        <input
          id="subscribe-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="min-w-0 flex-1 rounded border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
        >
          {status === "loading" ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      {/* Honeypot: hidden from real users, tempting to bots. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      {status === "error" && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
          Something went wrong — please try again in a minute.
        </p>
      )}
    </form>
  );
}
