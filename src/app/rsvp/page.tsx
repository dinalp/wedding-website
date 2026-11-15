"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { setPendingVisit } from "@/lib/rsvp-visit";

const inputStyle = "w-full bg-white border border-charcoal/30 rounded-sm px-4 py-4 text-charcoal text-base focus:outline-2 focus:outline-accent";
const buttonStyle = "w-full mt-4 bg-charcoal text-white font-sans text-xs tracking-[0.2em] py-4 rounded-sm transition-opacity hover:opacity-90 disabled:opacity-50";

export default function FindInvitationPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [emailHint, setEmailHint] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setPendingVisit(null); }, []);
  useEffect(() => { if (sent) codeRef.current?.focus(); }, [sent]);
  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function action(path: string, body: object) {
    setBusy(true); setError(null); setMessage(null);
    try {
      const response = await fetch(path, { method: "POST", cache: "no-store",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Please try again shortly.");
      if (data.next === "form") {
        setPendingVisit(data.visit);
        router.push("/rsvp/current");
      } else if (data.next === "verify") {
        setEmailHint(data.emailHint); setSent(false); setCode("");
      } else if (data.message) {
        setMessage(data.message);
        if (path.endsWith("/send")) { setSent(true); setCode(""); setCooldown(60); }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to connect. Please try again.");
    } finally { setBusy(false); }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <header className="px-4 md:px-8 py-6">
        <Link href="/" className="font-serif text-xl tracking-widest text-charcoal">D &amp; S</Link>
      </header>
      <div className="flex-1 flex items-start justify-center px-4 pb-16 pt-6 md:pt-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
          <h1 className="font-serif text-4xl md:text-5xl font-light text-charcoal text-center">
            {emailHint ? "Check your email" : "Find your invitation"}
          </h1>
          <div className="divider mx-auto mt-6" />
          {!emailHint ? (
            <form onSubmit={(event) => { event.preventDefault(); void action("/api/rsvp/search", { name }); }} className="mt-8">
              <p className="font-sans text-charcoal/70 text-sm leading-relaxed mb-8 text-center">
                Enter your full name as it appears on your invitation. You can RSVP for everyone in your party.
              </p>
              <label htmlFor="guest-name" className="block font-sans text-xs tracking-wider text-charcoal mb-3">YOUR FULL NAME</label>
              <input id="guest-name" autoComplete="name" required maxLength={100}
                value={name} onChange={(event) => setName(event.target.value)} className={inputStyle} />
              <button disabled={busy} className={buttonStyle}>{busy ? "CHECKING…" : "CONTINUE"}</button>
            </form>
          ) : (
            <div className="mt-8 font-sans text-sm text-charcoal/80">
              <p className="leading-relaxed">To open your RSVP, we’ll send a one-time code to <strong className="break-all">{emailHint}</strong>.</p>
              <button type="button" disabled={busy || cooldown > 0} onClick={() => void action("/api/rsvp/otp/send", {})} className={buttonStyle}>
                {cooldown > 0 ? `RESEND IN ${cooldown}s` : sent ? "SEND A NEW CODE" : "SEND CODE"}
              </button>
              {sent && (
                <form className="mt-8" onSubmit={(event) => { event.preventDefault(); void action("/api/rsvp/otp/verify", { code }); }}>
                  <label htmlFor="rsvp-code" className="block mb-3">Six-digit code</label>
                  <input ref={codeRef} id="rsvp-code" type="text" inputMode="numeric" autoComplete="one-time-code"
                    pattern="[0-9]{6}" minLength={6} maxLength={6} required aria-describedby="code-help"
                    value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} className={inputStyle} />
                  <p id="code-help" className="mt-2">You can paste the code. It expires after 10 minutes.</p>
                  <button disabled={busy} className={buttonStyle}>{busy ? "CHECKING…" : "OPEN MY RSVP"}</button>
                </form>
              )}
              <button type="button" disabled={busy} onClick={() => { setEmailHint(null); setError(null); setMessage(null); }} className="mt-6 underline py-2">Use a different name</button>
            </div>
          )}
          <div aria-live="polite" className="mt-6 font-sans text-sm leading-relaxed text-center">
            {message && <p>{message}</p>}
            {error && <p role="alert" className="text-red-800">{error}</p>}
          </div>
          <p className="mt-8 font-sans text-sm text-charcoal/70 leading-relaxed text-center">
            Need help or can’t access that email? Contact Dinal &amp; Shayani through your usual message thread and we’ll help you with your invitation.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
