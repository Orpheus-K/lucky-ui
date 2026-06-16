
import { test, expect } from '@playwright/test';

test('LkToast top position uses slide-down animation', async ({ page }) => {
  await page.goto('/components/demos/toast-demo');
  
  // 点击“顶部”按钮
  await page.getByRole('button', { name: '顶部' }).click();
  
  // 获取生成的 toast 元素
  const toastInner = page.locator('.lk-toast__inner');
  
  // 检查是否包含 slide-down 相关的类名
  // 根据 useTransition 的实现，这里应该会带有 lk-transition-slide-down
  await expect(toastInner).toHaveClass(/lk-transition-slide-down/);
});
