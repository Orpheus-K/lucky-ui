export function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

/** 解析 YYYY-MM-DD 返回 Date, 失败返回当前 */
export function parseDate(str: string) {
  if (!str) return new Date(NaN);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
  if (!m) return new Date(NaN);
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return d;
}
export function formatDate(d: Date) {
  if (isNaN(+d)) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
/** 返回两个日期之间（含）天数数组的字符串 YYYY-MM-DD 列 */
export function dateRangeArray(start: string, end: string) {
  const s = parseDate(start);
  const e = parseDate(end);
  if (isNaN(+s) || isNaN(+e) || s > e) return [];
  const res: string[] = [];
  const cur = new Date(s);
  while (cur <= e) {
    res.push(formatDate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return res;
}
