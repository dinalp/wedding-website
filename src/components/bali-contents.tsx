"use client";

import { useEffect, useRef, useState } from "react";

const GROUPS = [
  { title: "Enjoy Uluwatu", links: [
    ["week", "Make a week of it"],
    ["do", "Things to do"],
    ["clubs", "Beach clubs & dining"],
  ] },
  { title: "While you’re here", links: [
    ["getting-around", "Getting around & apps"],
    ["money", "Money & travel cards"],
    ["work", "Working remotely"],
  ] },
  { title: "Before you fly", links: [
    ["food-safety", "Food safety & Travelan"],
    ["visas", "Visas & arrival"],
    ["insurance", "Travel insurance"],
  ] },
];
const IDS = GROUPS.flatMap((group) => group.links.map(([id]) => id));

export function BaliContents() {
  const [active, setActive] = useState("");
  const mobileMenu = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const sections = IDS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    const update = () => {
      const current = sections.filter((el) => el.getBoundingClientRect().top <= 180).at(-1);
      setActive(current?.id ?? "");
    };
    const observer = new IntersectionObserver(update, { rootMargin: "-100px 0px -60% 0px", threshold: 0 });
    sections.forEach((el) => observer.observe(el));
    window.addEventListener("hashchange", update);
    update();
    return () => { observer.disconnect(); window.removeEventListener("hashchange", update); };
  }, []);

  const contents = (
    <nav aria-label="Table of contents" className="space-y-6">
      {GROUPS.map((group) => (
        <div key={group.title}>
          <p className="font-sans text-xs font-semibold text-charcoal mb-2">{group.title}</p>
          <ul className="space-y-1">
            {group.links.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} aria-current={active === id ? "location" : undefined}
                  onClick={() => {
                    setActive(id);
                    if (mobileMenu.current) mobileMenu.current.open = false;
                    requestAnimationFrame(() => {
                      const target = document.getElementById(id);
                      target?.setAttribute("tabindex", "-1");
                      target?.focus({ preventScroll: true });
                    });
                  }}
                  className={`block py-2 pl-3 border-l text-sm leading-snug transition-colors ${active === id ? "border-accent text-accent font-medium bg-accent/5" : "border-charcoal/15 text-charcoal/75 hover:border-accent hover:text-accent"}`}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <a href="#guide-top" className="inline-block py-2 font-sans text-xs text-accent underline underline-offset-4">Back to the top</a>
    </nav>
  );

  return (
    <aside className="sticky top-0 z-30 bg-background border-y border-charcoal/15 xl:border-0 xl:top-8 xl:self-start xl:max-h-[calc(100dvh-4rem)] xl:overflow-y-auto">
      <div className="hidden xl:block py-2 pr-5">
        <h2 className="font-[family-name:var(--font-cormorant)] text-2xl mb-6">In this guide</h2>
        {contents}
      </div>
      <details ref={mobileMenu} className="xl:hidden group">
        <summary className="flex items-center justify-between py-4 px-1 font-sans text-sm font-medium cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          In this guide <span className="flex items-center gap-3 text-charcoal/65 text-xs">9 topics
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="group-open:rotate-180 transition-transform"><path d="m6 9 6 6 6-6" /></svg>
          </span>
        </summary>
        <div className="max-h-[65dvh] overflow-y-auto pb-5 px-1">{contents}</div>
      </details>
    </aside>
  );
}
