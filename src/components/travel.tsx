import Link from "next/link";

export const aud = (n: number) => `A$${n.toLocaleString("en-AU")}`;

export const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-AU", { day: "numeric", month: "short" });

const TABS = [
  { href: "/flights", label: "Flights" },
  { href: "/stays", label: "Stays" },
] as const;

export function TravelHeader({ active }: { active: "/flights" | "/stays" }) {
  return (
    <header className="px-4 md:px-8 py-6 max-w-5xl mx-auto flex items-center justify-between">
      <Link
        href="/"
        className="font-[family-name:var(--font-cormorant)] text-xl tracking-widest text-charcoal"
      >
        D &amp; S
      </Link>
      <nav className="flex gap-1 bg-cream rounded-sm p-1 font-sans text-xs tracking-wider">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            aria-current={t.href === active ? "page" : undefined}
            className={`px-4 py-2 rounded-sm transition-colors ${
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

interface Series {
  label: string;
  color: string;
  values: (number | null)[];
}

/** Server-rendered SVG line chart. ponytail: no chart lib, one chart type is all we need. */
export function TrendChart({
  dates,
  series,
  cap,
  capLabel,
}: {
  dates: string[];
  series: Series[];
  cap?: number;
  capLabel?: string;
}) {
  const W = 640, H = 260, L = 52, R = 16, T = 16, B = 32;
  const all = series.flatMap((s) => s.values).filter((v): v is number => v != null);
  if (cap != null) all.push(cap);
  if (all.length === 0) return null;
  const pad = Math.max((Math.max(...all) - Math.min(...all)) * 0.1, 5);
  const lo = Math.min(...all) - pad, hi = Math.max(...all) + pad;
  const x = (i: number) => L + (dates.length === 1 ? 0 : (i * (W - L - R)) / (dates.length - 1));
  const y = (v: number) => T + ((hi - v) * (H - T - B)) / (hi - lo);

  const step = [5, 10, 20, 25, 50, 100, 200].find((s) => (hi - lo) / s <= 5) ?? 500;
  const ticks: number[] = [];
  for (let t = Math.ceil(lo / step) * step; t <= hi; t += step) ticks.push(t);
  const labelIdx = [...new Set([0, Math.round((dates.length - 1) / 3), Math.round((2 * (dates.length - 1)) / 3), dates.length - 1])];

  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Price trend from ${shortDate(dates[0])} to ${shortDate(dates[dates.length - 1])}`}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="var(--cream)" strokeWidth={1} />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="#8a8a7a">
              ${t}
            </text>
          </g>
        ))}
        {cap != null && (
          <line x1={L} x2={W - R} y1={y(cap)} y2={y(cap)} stroke="#b9b39f" strokeDasharray="4 4" />
        )}
        {labelIdx.map((i) => (
          <text key={i} x={x(i)} y={H - 10} textAnchor={i === 0 ? "start" : i === dates.length - 1 ? "end" : "middle"} fontSize={11} fill="#8a8a7a">
            {shortDate(dates[i])}
          </text>
        ))}
        {series.map((s) => {
          const pts = s.values.flatMap((v, i) => (v == null ? [] : [[x(i), y(v)] as const]));
          const last = pts[pts.length - 1];
          return (
            <g key={s.label}>
              <polyline
                points={pts.map((p) => p.join(",")).join(" ")}
                fill="none"
                stroke={s.color}
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {last && <circle cx={last[0]} cy={last[1]} r={4} fill={s.color} />}
            </g>
          );
        })}
      </svg>
      <figcaption className="flex flex-wrap gap-x-5 gap-y-1 justify-center font-sans text-xs text-charcoal/70 mt-2">
        {series.map((s) => (
          <span key={s.label} className="flex items-center gap-2">
            <span className="inline-block w-4 h-[3px] rounded" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
        {cap != null && (
          <span className="flex items-center gap-2">
            <span className="inline-block w-4 border-t-2 border-dashed border-[#b9b39f]" />
            {capLabel}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

export function Stat({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
  return (
    <div className="bg-cream rounded-sm p-5">
      <p className="font-sans text-xs tracking-wider text-charcoal/60">{label.toUpperCase()}</p>
      <p className="font-[family-name:var(--font-cormorant)] text-4xl text-charcoal mt-1">{value}</p>
      {children && <p className="font-sans text-xs text-charcoal/60 mt-2">{children}</p>}
    </div>
  );
}
