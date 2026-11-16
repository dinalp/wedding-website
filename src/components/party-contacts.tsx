"use client";

import type { PartyMember } from "../lib/types";

export type ContactDrafts = Record<string, { email: string; phone: string; selected: boolean }>;

function focusContactInput(input: HTMLInputElement | null) {
  input?.focus();
}

/** Drafts survive deselection; only selected guests' details are submitted. */
export function PartyContacts({ members, contacts, onChange }: {
  members: PartyMember[];
  contacts: ContactDrafts;
  onChange: (contacts: ContactDrafts) => void;
}) {
  function toggle(member: PartyMember) {
    const next = { ...contacts };
    if (next[member.id]) next[member.id] = { ...next[member.id], selected: !next[member.id].selected };
    else next[member.id] = { email: member.email ?? "", phone: member.phone ?? "", selected: true };
    onChange(next);
  }

  return (
    <div>
      <p id="contact-selection-help" className="font-sans text-sm text-white/80 mb-3">Tap a name to add or edit their details. You can choose more than one guest.</p>
      <div role="group" aria-label="Guests to receive updates" aria-describedby="contact-selection-help" className="flex flex-wrap gap-2 mb-6">
        {members.map((member) => (
          <button key={member.id} type="button" aria-pressed={!!contacts[member.id]?.selected}
            aria-controls={contacts[member.id]?.selected ? `contact-${member.id}` : undefined}
            onClick={() => toggle(member)}
            className={`min-h-11 max-w-full px-4 py-3 rounded-full border font-sans text-sm break-words transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              contacts[member.id]?.selected ? "bg-accent/20 text-white border-accent" : "bg-white/5 text-white/80 border-white/30 hover:border-white/60"
            }`}>
            {member.name}
          </button>
        ))}
      </div>
      {members.filter((member) => contacts[member.id]?.selected).map((member) => (
        <fieldset key={member.id} id={`contact-${member.id}`} className="mb-6 space-y-3 min-w-0">
          <legend className="font-serif text-xl text-white mb-2 break-words">{member.name}</legend>
          <label htmlFor={`email-${member.id}`} className="block font-sans text-sm text-white/80">Email (optional)</label>
          <input ref={focusContactInput} id={`email-${member.id}`} type="email" maxLength={320} autoComplete="off"
            value={contacts[member.id].email}
            onChange={(event) => onChange({ ...contacts, [member.id]: { ...contacts[member.id], email: event.target.value } })}
            className="w-full bg-white/10 border border-white/30 rounded-sm px-4 py-3 text-white text-base focus:outline-2 focus:outline-accent" />
          <label htmlFor={`phone-${member.id}`} className="block font-sans text-sm text-white/80">Mobile (optional)</label>
          <input id={`phone-${member.id}`} type="tel" inputMode="tel" maxLength={40} autoComplete="off"
            value={contacts[member.id].phone}
            onChange={(event) => onChange({ ...contacts, [member.id]: { ...contacts[member.id], phone: event.target.value } })}
            className="w-full bg-white/10 border border-white/30 rounded-sm px-4 py-3 text-white text-base focus:outline-2 focus:outline-accent" />
        </fieldset>
      ))}
    </div>
  );
}
