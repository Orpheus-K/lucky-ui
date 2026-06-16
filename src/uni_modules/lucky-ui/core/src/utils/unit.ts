/**
 * 添加单位
 * @param value 值
 * @param unit 单位，默认 rpx
 */
export function addUnit(value: string | number | undefined, unit = 'rpx'): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  return /^\d+(\.\d+)?$/.test(String(value)) ? `${value}${unit}` : String(value);
}
