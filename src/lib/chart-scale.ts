// A hard iteration bound is required even when floating-point addition stops
// making progress. Work in normalized units to avoid overflow near MAX_VALUE.
export const MAX_CHART_TICKS = 7;

export function chartScale(values: number[]) {
  const finite = values.filter(Number.isFinite);
  if (!finite.length) return null;
  let min = Infinity, max = -Infinity;
  for (const value of finite) { min = Math.min(min, value); max = Math.max(max, value); }
  const scale = Math.max(Math.abs(min), Math.abs(max), 1);
  const low = min / scale, high = max / scale;
  const pad = Math.max((high - low) * 0.1, Math.min(5 / scale, 1), Number.EPSILON * 4);
  const lo = low - pad, hi = high + pad;
  const range = hi - lo;
  const rawStep = range / (MAX_CHART_TICKS - 1);
  const power = 10 ** Math.floor(Math.log10(rawStep));
  const step = ([1, 2, 2.5, 5, 10].find((n) => n * power >= rawStep) ?? 10) * power;
  const first = Math.ceil(lo / step) * step;
  const ticks: number[] = [];
  for (let i = 0; i < MAX_CHART_TICKS; i++) {
    const position = first + i * step;
    const value = position * scale;
    if (position > hi) break;
    if (!Number.isFinite(value)) continue;
    if (ticks.length && value <= ticks[ticks.length - 1]) break;
    ticks.push(value);
  }
  return { ticks, fraction: (value: number) => (hi - value / scale) / range };
}
