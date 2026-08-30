"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Party, PartyMember } from "@/lib/types";

const EVENTS = [
  {
    key: "welcomeDinner" as const,
    label: "Welcome Dinner",
    detail: "May 19 · 7:00 PM",
    description: "Intimate dinner to kick off the celebrations",
  },
  {
    key: "wedding" as const,
    label: "Wedding Ceremony & Reception",
    detail: "May 20 · 4:00 PM onwards",
    description:
      "The main event — ceremony, cocktail hour, then dinner and dancing",
    highlight: true,
  },
  {
    key: "recoveryDay" as const,
    label: "Recovery Day",
    detail: "May 21 · All day",
    description: "A relaxed final day together — plans to be confirmed",
  },
];

export default function RSVPPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;

  const [party, setParty] = useState<Party | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [members, setMembers] = useState<PartyMember[]>([]);
  const [email, setEmail] = useState("");
  const [songRequest, setSongRequest] = useState("");
  const [message, setMessage] = useState("");
  const [expandedDietary, setExpandedDietary] = useState<Set<string>>(
    new Set()
  );

  const fetchParty = useCallback(async () => {
    try {
      const res = await fetch(`/api/rsvp?code=${code}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("This invite link is not valid. Please check your link and try again.");
        } else {
          setError("Something went wrong. Please try again later.");
        }
        return;
      }
      const data: Party = await res.json();
      setParty(data);
      setMembers(data.members.map((m) => ({ ...m, events: { ...m.events } })));
      setEmail(data.email);
      setSongRequest(data.songRequest);
      setMessage(data.message);

      // Expand dietary for members who already have requirements
      const withDietary = new Set<string>();
      for (const m of data.members) {
        if (m.dietaryRequirements) withDietary.add(m.id);
      }
      setExpandedDietary(withDietary);
    } catch {
      setError("Unable to connect. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    fetchParty();
  }, [fetchParty]);

  function toggleAttending(memberId: string) {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        const attending = !m.attending;
        return {
          ...m,
          attending,
          events: attending
            ? m.events
            : { welcomeDinner: false, recoveryDay: false, wedding: false },
        };
      })
    );
  }

  function toggleEvent(
    memberId: string,
    event: "welcomeDinner" | "recoveryDay" | "wedding"
  ) {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        return {
          ...m,
          events: { ...m.events, [event]: !m.events[event] },
        };
      })
    );
  }

  function setDietary(memberId: string, value: string) {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId ? { ...m, dietaryRequirements: value } : m
      )
    );
  }

  function toggleDietaryExpanded(memberId: string) {
    setExpandedDietary((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
        // Clear dietary when collapsing
        setMembers((prevMembers) =>
          prevMembers.map((m) =>
            m.id === memberId ? { ...m, dietaryRequirements: "" } : m
          )
        );
      } else {
        next.add(memberId);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          email,
          members: members.map((m) => ({
            id: m.id,
            attending: m.attending,
            events: m.events,
            dietaryRequirements: m.dietaryRequirements,
          })),
          songRequest,
          message,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit");
      }

      setSubmitted(true);
    } catch {
      setError("Failed to submit your RSVP. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="font-serif text-4xl text-white">D & S</p>
          <div className="divider mx-auto mt-4" />
          <p className="font-sans text-white/50 text-sm tracking-widest mt-4">
            LOADING...
          </p>
        </motion.div>
      </div>
    );
  }

  if (error && !party) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <p className="font-serif text-4xl text-white mb-4">D & S</p>
          <div className="divider mx-auto mb-8" />
          <p className="font-sans text-white/70 leading-relaxed">{error}</p>
          <a
            href="/"
            className="inline-block mt-8 font-sans text-accent text-sm tracking-wider hover:text-accent-light transition-colors"
          >
            RETURN HOME
          </a>
        </motion.div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-lg"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-8"
          >
            <svg
              className="w-10 h-10 text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
          <h2 className="font-serif text-5xl text-white mb-4">Thank You</h2>
          <div className="divider mx-auto mb-6" />
          <p className="font-sans text-white/70 leading-relaxed mb-2">
            Your RSVP has been received, {party?.name}.
          </p>
          <p className="font-sans text-white/50 text-sm leading-relaxed">
            You can revisit this link any time to update your response.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-8 font-sans text-accent text-sm tracking-wider hover:text-accent-light transition-colors"
          >
            UPDATE RSVP
          </button>
          <div className="mt-4">
            <a
              href="/"
              className="font-sans text-white/40 text-sm tracking-wider hover:text-white/60 transition-colors"
            >
              RETURN HOME
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  const isUpdate = !!party?.submittedAt;

  return (
    <div className="min-h-screen bg-charcoal">
      {/* Header */}
      <div className="py-12 px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <a href="/" className="font-serif text-xl tracking-widest text-white">
            D & S
          </a>
        </motion.div>
      </div>

      <div className="max-w-2xl mx-auto px-8 pb-24">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="font-sans text-accent-light tracking-[0.3em] text-xs mb-4">
            {isUpdate ? "UPDATE YOUR RESPONSE" : "WE HOPE YOU CAN JOIN US"}
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-light text-white">
            RSVP
          </h1>
          <div className="divider mx-auto mt-6" />
          <p className="font-sans text-white/50 mt-6 text-sm">
            Welcome, {party?.name}
          </p>
          {isUpdate && (
            <p className="font-sans text-accent/70 text-xs mt-2 tracking-wider">
              LAST SUBMITTED{" "}
              {new Date(party!.submittedAt!).toLocaleDateString("en-AU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-sm text-center"
          >
            <p className="font-sans text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Party Members */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6 mb-12"
          >
            <p className="font-sans text-white/80 text-xs tracking-wider">
              WHO&apos;S ATTENDING?
            </p>

            {members.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`border rounded-sm transition-colors ${
                  member.attending
                    ? "bg-white/5 border-accent/30"
                    : "bg-white/[0.02] border-white/10"
                }`}
              >
                {/* Member toggle */}
                <button
                  type="button"
                  onClick={() => toggleAttending(member.id)}
                  className="w-full flex items-center gap-4 p-5 text-left"
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      member.attending
                        ? "border-accent bg-accent"
                        : "border-white/30"
                    }`}
                  >
                    {member.attending && (
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`font-serif text-xl transition-colors ${
                      member.attending ? "text-white" : "text-white/50"
                    }`}
                  >
                    {member.name}
                  </span>
                </button>

                {/* Events + dietary (shown when attending) */}
                <AnimatePresence>
                  {member.attending && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-3">
                        <p className="font-sans text-white/40 text-xs tracking-wider pt-2">
                          EVENTS
                        </p>

                        {EVENTS.map((event) => (
                          <label
                            key={event.key}
                            className={`flex items-start gap-3 p-3 rounded-sm cursor-pointer transition-colors ${
                              event.highlight
                                ? "bg-accent/10 hover:bg-accent/15"
                                : "bg-white/[0.03] hover:bg-white/[0.06]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={member.events[event.key]}
                              onChange={() => toggleEvent(member.id, event.key)}
                              className="mt-0.5 w-4 h-4 rounded border-white/30 bg-white/10 text-accent focus:ring-accent focus:ring-offset-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="font-serif text-white text-base">
                                  {event.label}
                                </span>
                                <span
                                  className={`font-sans text-xs ${
                                    event.highlight
                                      ? "text-accent-light"
                                      : "text-white/40"
                                  }`}
                                >
                                  {event.detail}
                                </span>
                              </div>
                            </div>
                          </label>
                        ))}

                        {/* Dietary toggle */}
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() =>
                              toggleDietaryExpanded(member.id)
                            }
                            className="font-sans text-xs text-white/40 hover:text-white/60 tracking-wider transition-colors flex items-center gap-2"
                          >
                            <svg
                              className={`w-3 h-3 transition-transform ${
                                expandedDietary.has(member.id)
                                  ? "rotate-90"
                                  : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                            {expandedDietary.has(member.id)
                              ? "DIETARY REQUIREMENTS"
                              : "ADD DIETARY REQUIREMENTS"}
                          </button>
                          <AnimatePresence>
                            {expandedDietary.has(member.id) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <textarea
                                  rows={2}
                                  value={member.dietaryRequirements}
                                  onChange={(e) =>
                                    setDietary(member.id, e.target.value)
                                  }
                                  className="mt-3 w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-white placeholder:text-white/20 font-sans text-sm resize-none focus:border-accent focus:outline-none"
                                  placeholder={`Allergies or dietary needs for ${member.name.split(" ")[0]}...`}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>

          {/* Email */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <label
              htmlFor="email"
              className="font-sans text-white/80 text-xs tracking-wider block mb-2"
            >
              EMAIL ADDRESS
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-sm px-4 py-3 text-white placeholder:text-white/30 font-sans text-sm focus:border-accent focus:outline-none"
              placeholder="your@email.com"
            />
            <p className="font-sans text-white/30 text-xs mt-2">
              For any updates about the celebration
            </p>
          </motion.div>

          {/* Song Request */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <label
              htmlFor="songRequest"
              className="font-sans text-white/80 text-xs tracking-wider block mb-2"
            >
              SONG REQUEST
            </label>
            <input
              id="songRequest"
              type="text"
              value={songRequest}
              onChange={(e) => setSongRequest(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-sm px-4 py-3 text-white placeholder:text-white/30 font-sans text-sm focus:border-accent focus:outline-none"
              placeholder="What song will get you on the dance floor?"
            />
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <label
              htmlFor="message"
              className="font-sans text-white/80 text-xs tracking-wider block mb-2"
            >
              MESSAGE FOR THE COUPLE
            </label>
            <textarea
              id="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-sm px-4 py-3 text-white placeholder:text-white/30 font-sans text-sm resize-none focus:border-accent focus:outline-none"
              placeholder="Share your love and wishes..."
            />
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="w-full bg-accent hover:bg-accent-dark disabled:opacity-50 text-white font-sans tracking-[0.2em] text-sm py-4 rounded-sm transition-colors"
            >
              {submitting
                ? "SENDING..."
                : isUpdate
                ? "UPDATE RSVP"
                : "SEND RSVP"}
            </motion.button>
          </motion.div>

          {/* RSVP deadline */}
          <p className="font-sans text-white/30 text-xs text-center mt-6 tracking-wider">
            PLEASE RESPOND BY JANUARY 20TH, 2027
          </p>
        </form>
      </div>
    </div>
  );
}
