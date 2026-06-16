import { test, expect } from '@playwright/test';

test('按钮加载状态文字和图标颜色保持白色，不随主题切换', async ({ page }) => {
  // 导航到测试页面，携带 component=button
  await page.goto('http://localhost:5173/pages_sub/showcase/index?component=button');
  
  // 等待页面加载
  await page.waitForLoadState('networkidle');

  // 找到“点击加载”按钮
  const loadButton = page.locator('text=点击加载');
  await expect(loadButton).toBeVisible();

  // 点击它，让它进入 loading 状态
  await loadButton.click();

  // 此时按钮应该变成“加载中...”
  const loadingButton = page.locator('text=加载中...');
  await expect(loadingButton).toBeVisible();

  // 检查 loading 状态下，按钮的 computed color
  const color = await loadingButton.evaluate((el) => {
    return window.getComputedStyle(el).color;
  });
  
  // 输出实际的颜色
  console.log('Light Mode - Loading Button Color:', color);
  
  // 预期应该是白色 rgb(255, 255, 255)
  expect(color).toBe('rgb(255, 255, 255)');

  // 切换到暗色主题（假设页面有个全局的 lk-theme-dark 类或者是改变系统的 preferred color scheme）
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.evaluate(() => {
    document.documentElement.classList.add('lk-theme-dark');
    document.documentElement.classList.remove('lk-theme-light');
  });

  // 再次获取颜色
  const darkColor = await loadingButton.evaluate((el) => {
    return window.getComputedStyle(el).color;
  });

  console.log('Dark Mode - Loading Button Color:', darkColor);
  expect(darkColor).toBe('rgb(255, 255, 255)');
});
