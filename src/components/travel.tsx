import Link from "next/link";

export const aud = (n: number) => `A$${n.toLocaleString("en-AU")}`;

export const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-AU", { day: "numeric", month: "short" });

const TABS = [
  { href: "/flights", label: "Flights" },
  { href: "/stays", label: "Stays" },
  { href: "/bali", label: "Bali Guide" },
  { href: "/dress-code", label: "Dress Code" },
] as const;

export function PageHeader({ active }: { active: (typeof TABS)[number]["href"] }) {
  return (
    <header className="px-4 md:px-8 py-6 max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-y-3">
      <Link
        href="/"
        className="font-[family-name:var(--font-cormorant)] text-xl tracking-widest text-charcoal"
      >
        D &amp; S
      </Link>
      <nav className="flex gap-1 bg-cream rounded-sm p-1 font-sans text-[11px] md:text-xs tracking-wider max-w-full overflow-x-auto">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            aria-current={t.href === active ? "page" : undefined}
            className={`px-3 md:px-4 py-2 rounded-sm whitespace-nowrap transition-colors ${
              t.href === active ? "bg-accent text-white" : "text-charcoal/70 hover:text-charcoal"
            }`}
          >
            {t.label.toUpperCase()}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function SubscribeNote() {
  return (
    <section className="mt-12 bg-charcoal text-white rounded-sm p-6 md:p-8 text-center">
      <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-light">
        Get these prices by email
      </h2>
      <p className="font-sans text-white/60 text-sm mt-3 leading-relaxed">
        Tick &ldquo;price updates&rdquo; when you RSVP and we&rsquo;ll send you a weekly
        update. Already RSVP&rsquo;d? Open your RSVP again and tick the box.
      </p>
      <Link
        href="/rsvp"
        className="inline-block mt-6 bg-accent hover:bg-accent-dark text-white font-sans tracking-[0.2em] text-xs px-10 py-3 rounded-sm transition-colors"
      >
        RSVP &amp; SUBSCRIBE
      </Link>
    </section>
  );
}

export { TrendChart } from "./trend-chart";

export function Stat({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
  return (
    <div className="bg-cream rounded-sm p-5">
      <p className="font-sans text-xs tracking-wider text-charcoal/60">{label.toUpperCase()}</p>
      <p className="font-[family-name:var(--font-cormorant)] text-4xl text-charcoal mt-1">{value}</p>
      {children && <p className="font-sans text-xs text-charcoal/60 mt-2">{children}</p>}
    </div>
  );
}
