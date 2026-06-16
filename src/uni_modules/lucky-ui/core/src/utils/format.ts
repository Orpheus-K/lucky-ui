import { Locale } from '../../../locale';

/**
 * 格式化价格
 */
export function formatPrice(
  price: number | string,
  currency: string = '¥',
  decimals: number = 2
): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) {
    return `${currency}0.00`;
  }

  return `${currency}${num.toLocaleString(Locale.locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 格式化时间
 */
export function formatTime(
  time: string | number | Date,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string {
  const date = new Date(time);
  if (isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 相对时间格式化
 */
export function formatRelativeTime(time: string | number | Date): string {
  const date = new Date(time);
  const now = new Date();

  if (isNaN(date.getTime())) return '';

  const diff = now.getTime() - date.getTime();
  const absDiff = Math.abs(diff);
  const isInPast = diff > 0;

  const minute = 60 * 1000;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;

  if (absDiff < minute) return Locale.t('lk.time.justNow');
  if (absDiff < hour) return formatRelative(Math.floor(absDiff / minute), 'minute', isInPast);
  if (absDiff < day) return formatRelative(Math.floor(absDiff / hour), 'hour', isInPast);
  if (absDiff < week) return formatRelative(Math.floor(absDiff / day), 'day', isInPast);
  if (absDiff < month) return formatRelative(Math.floor(absDiff / week), 'week', isInPast);
  if (absDiff < year) return formatRelative(Math.floor(absDiff / month), 'month', isInPast);
  return formatRelative(Math.floor(absDiff / year), 'year', isInPast);
}

function formatRelative(value: number, unitKey: string, isInPast: boolean): string {
  return Locale.t('lk.time.relative', {
    value,
    unit: Locale.t(`lk.time.${unitKey}`),
    suffix: Locale.t(isInPast ? 'lk.time.past' : 'lk.time.future'),
  });
}
