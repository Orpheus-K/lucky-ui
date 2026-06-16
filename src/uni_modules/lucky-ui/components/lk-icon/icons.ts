// /components/lk-icon/icons.ts
// 懒加载 bootstrap-icons 的 SVG 源码（H5/App WebView 可用）

// 使用 as: 'raw'，动态导入时 Promise<string>
const iconModules = import.meta.glob('./bootstrap-icons/icons/*.svg', {
  as: 'raw',
}) as Record<string, () => Promise<string>>;

/**
 * 根据名称异步获取一个内置的 Bootstrap 图标（raw SVG 字符串）
 * @param name 图标名称 (例如 'alarm-fill')
 * @returns Promise<string | null>
 */
export async function getBuiltInIcon(name: string): Promise<string | null> {
  if (!name) return null;

  // 注意：key 必须与上面的 glob 前缀一致
  const key = `bootstrap-icons/icons/${name}.svg`;
  const loader = iconModules[key];

  if (!loader) return null;

  try {
    const svg = await loader();
    return typeof svg === 'string' ? svg : null;
  } catch {
    return null;
  }
}
