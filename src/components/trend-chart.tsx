"use client";

import { useState } from "react";

const aud = (n: number) => `A$${n.toLocaleString("en-AU")}`;
const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-AU", { day: "numeric", month: "short" });

interface Series {
  label: string;
  color: string;
  values: (number | null)[];
}

/** SVG line chart with a hover crosshair. ponytail: no chart lib, one chart type is all we need. */
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
  const [hover, setHover] = useState<number | null>(null);
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

  const pick = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const vx = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((vx - L) / (W - L - R)) * (dates.length - 1));
    setHover(Math.min(Math.max(i, 0), dates.length - 1));
  };

  // Values under the crosshair, with their y-axis pills nudged apart so they never overlap.
  const hits =
    hover == null
      ? []
      : series
          .flatMap((s) => (s.values[hover] == null ? [] : [{ ...s, v: s.values[hover]!, py: y(s.values[hover]!) }]))
          .sort((a, b) => a.py - b.py);
  for (let k = 1; k < hits.length; k++) hits[k].py = Math.max(hits[k].py, hits[k - 1].py + 20);
  const dateX = hover == null ? 0 : Math.min(Math.max(x(hover), L + 26), W - R - 26);

  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto touch-pan-y outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
        role="img"
        tabIndex={0}
        aria-label={`Price trend from ${shortDate(dates[0])} to ${shortDate(dates[dates.length - 1])}. Use the arrow keys to read each day.`}
        onPointerMove={pick}
        onPointerDown={pick}
        onPointerLeave={() => setHover(null)}
        onBlur={() => setHover(null)}
        onKeyDown={(e) => {
          if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
          e.preventDefault();
          const d = e.key === "ArrowLeft" ? -1 : 1;
          setHover((h) => Math.min(Math.max((h ?? (d > 0 ? -1 : dates.length)) + d, 0), dates.length - 1));
        }}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="var(--cream)" strokeWidth={1} />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="#8a8a7a" opacity={hover == null ? 1 : 0.35}>
              ${t}
            </text>
          </g>
        ))}
        {cap != null && (
          <line x1={L} x2={W - R} y1={y(cap)} y2={y(cap)} stroke="#b9b39f" strokeDasharray="4 4" />
        )}
        {labelIdx.map((i) => (
          <text key={i} x={x(i)} y={H - 10} textAnchor={i === 0 ? "start" : i === dates.length - 1 ? "end" : "middle"} fontSize={11} fill="#8a8a7a" opacity={hover == null ? 1 : 0.35}>
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
              {last && hover == null && <circle cx={last[0]} cy={last[1]} r={4} fill={s.color} />}
            </g>
          );
        })}

        {hover != null && (
          <g pointerEvents="none" fontSize={11} fontWeight={600}>
            <line x1={x(hover)} x2={x(hover)} y1={T} y2={H - B} stroke="#2d2d2d" strokeOpacity={0.35} />
            {hits.map((h) => (
              <g key={h.label}>
                <line x1={L} x2={x(hover)} y1={y(h.v)} y2={y(h.v)} stroke={h.color} strokeOpacity={0.5} strokeDasharray="3 3" />
                <circle cx={x(hover)} cy={y(h.v)} r={5} fill={h.color} stroke="white" strokeWidth={2} />
                <rect x={2} y={h.py - 9} width={L - 6} height={18} rx={9} fill={h.color} />
                <text x={(L - 6) / 2 + 2} y={h.py + 4} textAnchor="middle" fill="white">
                  {aud(h.v).replace("A", "")}
                </text>
              </g>
            ))}
            {hits.length === 0 && (
              <text x={x(hover)} y={T + 12} textAnchor={x(hover) > W / 2 ? "end" : "start"} dx={x(hover) > W / 2 ? -6 : 6} fill="#8a8a7a" fontWeight={400}>
                No fare found this day
              </text>
            )}
            <rect x={dateX - 26} y={H - 24} width={52} height={20} rx={10} fill="#2d2d2d" />
            <text x={dateX} y={H - 10} textAnchor="middle" fill="white">
              {shortDate(dates[hover])}
            </text>
          </g>
        )}
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
      <p aria-live="polite" className="sr-only">
        {hover != null &&
          `${shortDate(dates[hover])}: ${hits.length ? hits.map((h) => `${h.label} ${aud(h.v)}`).join(", ") : "no fare found"}`}
      </p>
    </figure>
  );
}
