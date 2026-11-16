import "./helpers/tsx.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { setImmediate } from "node:timers/promises";
import { pageHarness } from "./helpers/page-harness.mjs";
import * as validation from "../src/lib/rsvp-validation.ts";
import * as types from "../src/lib/types.ts";
const contactsComponent = await import("../src/components/party-contacts.tsx");

function nodes(tree, type) {
  if (tree == null || typeof tree !== "object") return [];
  if (Array.isArray(tree)) return tree.flatMap((child) => nodes(child, type));
  return [...(tree.type === type ? [tree] : []), ...nodes(tree.props?.children, type)];
}

const router = { push() { throw new Error("Unexpected navigation"); }, replace() { throw new Error("Unexpected navigation"); } };
const dependencies = {
  "next/navigation": { useRouter: () => router },
  "next/link": { default: "a" },
  "framer-motion": { motion: { div: "div" }, AnimatePresence: "div" },
  "@/lib/rsvp-visit": { getPendingVisit: () => "test-visit", setPendingVisit() {} },
  "@/lib/rsvp-validation": validation,
  "@/lib/types": types,
  "@/components/party-contacts": contactsComponent,
  "@/components/bali-dates": { BaliDates: "div" },
};
const member = { id: "one", name: "First Guest", attending: true, events: { wedding: true }, dietary: [], dietaryNotes: "" };
const party = { id: "party", name: "Test Party", respondingGuestId: "one", email: "first@example.test", phone: "+61400111222",
  invitedTo: ["wedding"], members: [member, { ...member, id: "two", name: "Second Guest" }],
  songRequest: "", message: "", submittedAt: null };

test("page submits selected drafts while collapsed; deselection and explicit Skip omit contacts", async (t) => {
  for (const action of ["collapse", "deselect", "reselect", "skip"]) {
    await t.test(action, async (t) => {
      globalThis.window = { addEventListener() {}, removeEventListener() {} };
      t.after(() => { delete globalThis.window; });
      let submitted;
      t.mock.method(globalThis, "fetch", async (_url, init) => {
        if (init.method === "POST") submitted = JSON.parse(init.body);
        return Response.json(party);
      });
      const render = pageHarness(new URL("../src/app/rsvp/current/page.tsx", import.meta.url), dependencies);
      render();
      await setImmediate();
      const disclosure = () => nodes(render(), "button").find((node) => node.props["aria-controls"] === "party-contacts");
      disclosure().props.onClick();
      const contactPanel = () => {
        const component = nodes(render(), contactsComponent.PartyContacts)[0];
        return contactsComponent.PartyContacts(component.props);
      };
      const toggle = () => nodes(contactPanel(), "button")[0].props.onClick();
      toggle();
      nodes(contactPanel(), "input")[0].props.onChange({ target: { value: "draft@example.test" } });
      nodes(contactPanel(), "input")[1].props.onChange({ target: { value: "+61411999888" } });
      if (action === "deselect" || action === "reselect") toggle();
      if (action === "reselect") {
        disclosure().props.onClick();
        disclosure().props.onClick();
        toggle();
        assert.equal(nodes(contactPanel(), "input")[0].props.value, "draft@example.test");
      }
      if (action === "skip") nodes(render(), "button").find((node) => node.props.children === "Skip for now").props.onClick();
      else disclosure().props.onClick();
      assert.equal(disclosure().props["aria-expanded"], false);
      await nodes(render(), "form")[0].props.onSubmit({ preventDefault() {} });
      assert.ok(submitted);
      assert.equal(submitted.members[0].email, undefined, "responding guest never gets secondary contacts");
      assert.equal(submitted.members[0].phone, undefined);
      const expected = action === "collapse" || action === "reselect";
      assert.equal(submitted.members[1].email, expected ? "draft@example.test" : undefined);
      assert.equal(submitted.members[1].phone, expected ? "+61411999888" : undefined);
      assert.equal(submitted.members[1].selected, undefined, "UI selection state stays out of the payload");
    });
  }
});

test("invitation page shows missing-email API help without offering a code or navigating", async (t) => {
  const help = "We can’t reopen your RSVP because there’s no email address on file. Please contact Dinal & Shayani directly through your usual message thread and we’ll help you update it.";
  t.mock.method(globalThis, "fetch", async (url) => url.endsWith("/search")
    ? Response.json({ next: "continue" }) : Response.json({ error: help }, { status: 400 }));
  const render = pageHarness(new URL("../src/app/rsvp/page.tsx", import.meta.url), dependencies);
  nodes(render(), "form")[0].props.onSubmit({ preventDefault() {} });
  await setImmediate();
  nodes(render(), "button").find((node) => node.props.children === "CONTINUE").props.onClick();
  await setImmediate();
  const tree = render();
  assert.equal(nodes(tree, "p").find((node) => node.props.role === "alert").props.children, help);
  assert.equal(nodes(tree, "input").some((node) => node.props.id === "rsvp-code"), false);
});
