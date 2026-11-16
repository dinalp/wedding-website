import "./helpers/tsx.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
const { PartyContacts } = await import("../src/components/party-contacts.tsx");
const { TrendChart } = await import("../src/components/trend-chart.tsx");
import { chartScale, MAX_CHART_TICKS } from "../src/lib/chart-scale.ts";

function nodes(tree, type) {
  if (tree == null || typeof tree !== "object") return [];
  if (Array.isArray(tree)) return tree.flatMap((child) => nodes(child, type));
  return [...(tree.type === type ? [tree] : []), ...nodes(tree.props?.children, type)];
}

test("contact chips reveal multiple guests, focus their first input and retain deselected drafts", () => {
  const members = [
    { id: "one", name: "First Guest", email: "first@example.test", phone: "+61400111222" },
    { id: "two", name: "Second Guest", email: "", phone: "" },
  ];
  let contacts = {};
  const render = () => PartyContacts({ members, contacts, onChange: (next) => { contacts = next; } });
  const click = (id) => nodes(render(), "button").find((n) => n.key === id).props.onClick();
  assert.equal(nodes(render(), "input").length, 0);
  assert.deepEqual(nodes(render(), "button").map((n) => n.props["aria-pressed"]), [false, false]);
  click("one");
  assert.deepEqual(contacts.one, { email: members[0].email, phone: members[0].phone, selected: true });
  assert.equal(nodes(render(), "input").length, 2);
  let focused = false;
  const firstInput = nodes(render(), "input")[0];
  firstInput.props.ref({ focus() { focused = true; } });
  assert.equal(focused, true);
  assert.equal(firstInput.props.ref, nodes(render(), "input")[0].props.ref, "stable ref must not refocus on every keystroke");
  assert.equal(nodes(render(), "input")[1].props.ref, undefined);
  firstInput.props.ref(null);
  click("two");
  assert.equal(nodes(render(), "input").length, 4);
  assert.deepEqual(nodes(render(), "button").map((n) => n.props["aria-pressed"]), [true, true]);
  nodes(render(), "input").find((n) => n.props.id === "email-one").props.onChange({ target: { value: "pending@example.test" } });
  assert.equal(contacts.one.email, "pending@example.test");
  click("one");
  assert.equal(contacts.one.selected, false);
  assert.equal(contacts.one.email, "pending@example.test");
  assert.equal(nodes(render(), "input").length, 2, "deselected fields are hidden");
  assert.ok(Object.hasOwn(contacts, "two"));
  click("one");
  assert.equal(contacts.one.email, "pending@example.test", "reselect restores the draft");
  const tree = render();
  for (const input of nodes(tree, "input")) {
    assert.ok(nodes(tree, "label").some((label) => label.props.htmlFor === input.props.id));
    assert.equal(input.props.required, undefined);
  }
  const markup = renderToStaticMarkup(tree);
  assert.match(markup, /role="group"/);
  assert.match(markup, /aria-pressed="true"/);
});

test("chart spacing scales with range and tick generation stays finite at numeric extremes", () => {
  for (const values of [[100, 120], [100, 1e20], [1e308, Number.MAX_VALUE], [-Number.MAX_VALUE, Number.MAX_VALUE],
    [1e20, 1e20], [0, 0], [Number.MIN_VALUE, 2 * Number.MIN_VALUE], [NaN, Infinity, 100]]) {
    const axis = chartScale(values);
    assert.ok(axis);
    assert.ok(axis.ticks.length > 0 && axis.ticks.length <= MAX_CHART_TICKS);
    assert.ok(axis.ticks.every(Number.isFinite));
    assert.ok(axis.ticks.every((tick, i) => i === 0 || tick > axis.ticks[i - 1]));
    for (const value of values.filter(Number.isFinite)) {
      assert.ok(Number.isFinite(axis.fraction(value)));
      assert.ok(axis.fraction(value) >= 0 && axis.fraction(value) <= 1);
    }
  }
  assert.equal(chartScale([NaN, Infinity]), null);
  assert.equal(chartScale([]), null);
});

test("chart renders extreme and invalid prices without invalid SVG coordinates or unbounded ticks", () => {
  const dates = ["2026-11-01", "2026-11-02", "2026-11-03"];
  for (const values of [[100, 1e20, null], [-Number.MAX_VALUE, Number.MAX_VALUE, Infinity], [NaN, 100, 110]]) {
    const html = renderToStaticMarkup(createElement(TrendChart, { dates, series: [{ label: "Fare", color: "black", values }] }));
    assert.match(html, /<svg/);
    assert.doesNotMatch(html, /NaN|Infinity/);
    assert.ok((html.match(/<line /g) || []).length <= MAX_CHART_TICKS);
  }
  assert.equal(renderToStaticMarkup(createElement(TrendChart, { dates: [], series: [] })), "");
});
