
import { test, expect } from '@playwright/test';

test('LkCard ripple effect', async ({ page }) => {
  await page.goto('/pages_sub/showcase/index'); // 假设在这里导航到 card demo
  
  // 查找启用了 ripple 的卡片
  const card = page.locator('.lk-card.lk-ripple').first();
  
  // 初始状态下不应有 wave 激活类
  await expect(card).not.toHaveClass(/lk-ripple--active/);
  
  // 点击触发波纹
  await card.click();
  
  // 检查是否应用了激活类
  await expect(card).toHaveClass(/lk-ripple--active/);
});
