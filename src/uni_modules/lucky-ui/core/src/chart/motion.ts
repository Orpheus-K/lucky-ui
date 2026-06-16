export const LiteChartEffect = {
  None: 'none',
  Subtle: 'subtle',
  Premium: 'premium',
} as const;

export type LiteChartEffect = (typeof LiteChartEffect)[keyof typeof LiteChartEffect];

export function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function easeOutCubic(value: number) {
  const t = clamp01(value);
  return 1 - Math.pow(1 - t, 3);
}

export function oscillate(phase: number) {
  return Math.sin(clamp01(phase) * Math.PI);
}

export function loopDistance(from: number, to: number) {
  const a = clamp01(from);
  const b = clamp01(to);
  if (a <= b) return b - a;
  return 1 - a + b;
}

export function movingWindow(phase: number, center: number, radius: number) {
  const distance = loopDistance(phase, center);
  const normalized = clamp01(1 - distance / Math.max(0.0001, radius));
  return easeOutCubic(normalized);
}

export function normalizeAnimationRepeat(value: number) {
  if (!Number.isFinite(value)) return 1;
  if (value <= 0) return 0;
  return Math.max(1, Math.round(value));
}
