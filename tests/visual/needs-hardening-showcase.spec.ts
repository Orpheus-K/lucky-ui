import { expect, test } from '@playwright/test';
import { SHOWCASE_CASES } from '../../src/components/showcase/showcase-cases';

const NEEDS_HARDENING_CASES = [
  'backtop',
  'curtain',
  'fab',
  'keyboard',
  'modal',
  'navbar',
  'overlay',
  'popup',
  'tabbar',
  'toast',
  'virtual-list',
] as const;

const CASES = SHOWCASE_CASES.filter(item => NEEDS_HARDENING_CASES.includes(item.slug as never));
const getShowcaseUrl = (slug: string) => `/?component=${slug}#/pages_sub/showcase/index?component=${slug}`;

test.describe('needs-hardening showcase baseline', () => {
  test('medium-risk hardening cases are explicitly tracked', () => {
    expect(CASES.map(item => item.slug).sort()).toEqual([...NEEDS_HARDENING_CASES].sort());
    expect(CASES.every(item => item.verifyStatus === 'verified')).toBe(true);
    expect(CASES.every(item => item.riskLevel === 'medium')).toBe(true);
  });

  for (const componentCase of CASES) {
    test(`${componentCase.slug} renders verified hardening metadata`, async ({ page }) => {
      await page.goto(getShowcaseUrl(componentCase.slug));
      await page.waitForLoadState('networkidle');
      await page.setViewportSize({ width: 390, height: 844 });

      const block = page.locator('.showcase-block').filter({ hasText: componentCase.title }).first();
      await expect(block).toBeVisible();
      await expect(block.locator('.case-title')).toHaveText(componentCase.title);
      await expect(block.locator('.status-badge')).toHaveText('已验证');
      await expect(block.locator('.risk-badge')).toHaveText('中风险');
      for (const riskNote of componentCase.riskNotes) {
        await expect(block.getByText(riskNote)).toBeVisible();
      }
      await expect(block.getByText('当前组件暂无展示内容')).toBeHidden();
    });
  }

  test('overlay opens embedded content and closes from content action', async ({ page }) => {
    await page.goto(getShowcaseUrl('overlay'));
    await page.waitForLoadState('networkidle');
    await page.setViewportSize({ width: 390, height: 844 });

    await page.getByText('嵌入内容').click();
    await expect(page.getByText('这是内容区域')).toBeVisible();

    await page.getByText('关闭').click();
    await expect(page.getByText('这是内容区域')).toBeHidden();
  });

  test('backtop controlled scroll mode reveals the button and returns to top', async ({ page }) => {
    await page.goto(getShowcaseUrl('backtop'));
    await page.waitForLoadState('networkidle');
    await page.setViewportSize({ width: 390, height: 844 });

    const scrollBox = page.locator('.sv-box').first();
    await scrollBox.evaluate(element => {
      element.scrollTop = 720;
      element.dispatchEvent(new Event('scroll'));
    });

    const button = page.locator('.lk-backtop').first();
    await expect(button).toBeVisible();
    await button.click();
    await expect.poll(async () => scrollBox.evaluate(element => element.scrollTop)).toBe(0);
  });

  test('navbar demo renders non-fixed variants with stable slots', async ({ page }) => {
    await page.goto(getShowcaseUrl('navbar'));
    await page.waitForLoadState('networkidle');
    await page.setViewportSize({ width: 390, height: 844 });

    const navbar = page.locator('.lk-navbar').first();
    await expect(navbar).toBeVisible();
    await expect(page.getByText('页面标题').first()).toBeVisible();
    await expect(page.getByText('搜索组件、文档、示例')).toBeVisible();
    await expect
      .poll(async () => navbar.evaluate(element => window.getComputedStyle(element).position))
      .not.toBe('fixed');
  });
});
