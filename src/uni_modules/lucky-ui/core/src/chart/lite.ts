export interface LiteChartPoint {
  label?: string;
  value: number;
}

export interface LiteChartRange {
  min: number;
  max: number;
  span: number;
}

export interface LiteChartPosition extends LiteChartPoint {
  x: number;
  y: number;
}

export function normalizeLiteChartValue(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

function normalizeLiteChartSize(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

export function getLiteChartRange(data: LiteChartPoint[]): LiteChartRange {
  const values = data.map(item => normalizeLiteChartValue(item.value));
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;
  return {
    min,
    max,
    span: Math.max(1, max - min),
  };
}

export function getLiteChartPositions(
  data: LiteChartPoint[],
  width: number,
  height: number,
  padding: number
): LiteChartPosition[] {
  if (!data.length) return [];

  const chartWidth = normalizeLiteChartSize(width);
  const chartHeight = normalizeLiteChartSize(height);
  const safePadding = Math.min(
    normalizeLiteChartSize(padding),
    Math.max(0, Math.min(chartWidth, chartHeight) / 2)
  );
  const range = getLiteChartRange(data);
  const innerWidth = Math.max(0, chartWidth - safePadding * 2);
  const innerHeight = Math.max(0, chartHeight - safePadding * 2);
  const hasFlatRange = range.max === range.min;

  return data.map((item, index) => {
    const ratio = data.length > 1 ? index / (data.length - 1) : 0.5;
    const value = normalizeLiteChartValue(item.value);
    const valueRatio = hasFlatRange ? 0.5 : (value - range.min) / range.span;
    return {
      ...item,
      x: safePadding + innerWidth * ratio,
      y: safePadding + innerHeight - innerHeight * valueRatio,
    };
  });
}

export function getNearestPointIndex(points: LiteChartPosition[], x: number) {
  if (!points.length) return -1;
  let nearest = 0;
  let distance = Math.abs(points[0].x - x);
  for (let index = 1; index < points.length; index += 1) {
    const nextDistance = Math.abs(points[index].x - x);
    if (nextDistance < distance) {
      nearest = index;
      distance = nextDistance;
    }
  }
  return nearest;
}

export function formatCompactNumber(value: number) {
  if (!Number.isFinite(value)) return '--';
  if (Math.abs(value) >= 10000) return `${Math.round(value / 1000) / 10}w`;
  if (Math.abs(value) >= 1000) return `${Math.round(value / 100) / 10}k`;
  return `${Math.round(value * 10) / 10}`;
}

export function formatLiteChartTooltipText(point: LiteChartPoint): string {
  const value = formatCompactNumber(point.value);
  const label = String(point.label || '').trim();
  return label ? `${label} ${value}` : value;
}
