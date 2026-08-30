"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { PartyMatch } from "@/lib/types";

export default function FindInvitationPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<PartyMatch[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 3) {
      setError("Please enter at least three letters of your name.");
      return;
    }

    setSearching(true);
    setError(null);
    setMatches(null);
    try {
      const res = await fetch(`/api/rsvp/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setMatches(data.matches as PartyMatch[]);
    } catch {
      setError("Something went wrong on our end. Please try again in a moment.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <header className="px-4 md:px-8 py-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-cormorant)] text-xl tracking-widest text-charcoal"
        >
          D &amp; S
        </Link>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 pb-16 pt-6 md:pt-16">
        <div className="w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="font-[family-name:var(--font-montserrat)] text-accent tracking-[0.2em] text-xs mb-4">
              MAY 19&ndash;21, 2027 &middot; ULUWATU, BALI
            </p>
            <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light text-charcoal">
              Find your invitation
            </h1>
            <div className="divider mx-auto mt-6" />
            <p className="font-[family-name:var(--font-montserrat)] text-charcoal/60 text-sm mt-6 leading-relaxed">
              Enter your name as it appears on your invitation. You&apos;ll be
              able to RSVP for everyone in your party.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            onSubmit={handleSearch}
            className="mt-10"
          >
            <label
              htmlFor="guest-name"
              className="block font-[family-name:var(--font-montserrat)] text-xs tracking-[0.15em] text-charcoal/50 mb-3"
            >
              YOUR FULL NAME
            </label>
            <input
              ref={inputRef}
              id="guest-name"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="name"
              enterKeyHint="search"
              placeholder="e.g. Sarah Jones"
              className="w-full bg-white border border-charcoal/15 rounded-sm px-4 py-4 text-charcoal text-base placeholder:text-charcoal/30 focus:border-accent"
            />

            <button
              type="submit"
              disabled={searching}
              className="w-full mt-4 bg-charcoal text-white font-[family-name:var(--font-montserrat)] text-xs tracking-[0.2em] py-4 rounded-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {searching ? "SEARCHING…" : "CONTINUE"}
            </button>
          </motion.form>

          <div aria-live="polite">
            {error && (
              <p className="mt-6 text-center font-[family-name:var(--font-montserrat)] text-sm text-red-700">
                {error}
              </p>
            )}

            <AnimatePresence>
              {matches !== null && matches.length === 0 && !error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 bg-cream/60 rounded-sm p-6 text-center"
                >
                  <p className="font-[family-name:var(--font-cormorant)] text-2xl text-charcoal">
                    We couldn&apos;t find that name
                  </p>
                  <p className="font-[family-name:var(--font-montserrat)] text-sm text-charcoal/60 mt-3 leading-relaxed">
                    Try the name exactly as it appears on your invitation, or
                    just your first name. If it still doesn&apos;t work, message
                    Dinal or Shayani and we&apos;ll sort it out.
                  </p>
                </motion.div>
              )}

              {matches !== null && matches.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-10"
                >
                  <p className="font-[family-name:var(--font-montserrat)] text-xs tracking-[0.15em] text-charcoal/50 text-center mb-4">
                    {matches.length === 1
                      ? "IS THIS YOU?"
                      : "WHICH ONE IS YOU?"}
                  </p>

                  <ul className="space-y-3">
                    {matches.map((match) => (
                      <li key={match.id}>
                        <button
                          onClick={() => router.push(`/rsvp/${match.id}`)}
                          className="w-full text-left bg-white border border-charcoal/15 rounded-sm p-5 transition-colors hover:border-accent"
                        >
                          <span className="block font-[family-name:var(--font-cormorant)] text-2xl text-charcoal">
                            {match.name}
                          </span>
                          <span className="block font-[family-name:var(--font-montserrat)] text-sm text-charcoal/60 mt-1">
                            {match.memberNames.join(" · ")}
                          </span>
                          {match.alreadySubmitted && (
                            <span className="inline-block mt-3 font-[family-name:var(--font-montserrat)] text-[11px] tracking-wider text-accent bg-accent/10 px-3 py-1 rounded-full">
                              ALREADY RESPONDED — YOU CAN STILL MAKE CHANGES
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>

                  <p className="font-[family-name:var(--font-montserrat)] text-xs text-charcoal/40 text-center mt-6">
                    Not seeing your party? Try searching a different name.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
