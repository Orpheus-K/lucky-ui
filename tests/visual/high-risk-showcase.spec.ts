import { expect, test } from '@playwright/test';
import { SHOWCASE_CASES } from '../../src/components/showcase/showcase-cases';

const HIGH_RISK_CASES = SHOWCASE_CASES.filter(item => item.riskLevel === 'high');
const getShowcaseUrl = (slug: string) => `/?component=${slug}#/pages_sub/showcase/index?component=${slug}`;

async function openCase(page: import('@playwright/test').Page, slug: string) {
  await page.goto(getShowcaseUrl(slug));
  await page.waitForLoadState('networkidle');
  await page.setViewportSize({ width: 390, height: 844 });
}

test.describe('high-risk showcase baseline', () => {
  test('high-risk cases are explicitly tracked', () => {
    expect(HIGH_RISK_CASES.map(item => item.slug).sort()).toEqual([
      'picker',
      'tabbar-container',
      'tooltip',
      'waterfall',
    ]);
  });

  for (const componentCase of HIGH_RISK_CASES) {
    test(`${componentCase.slug} renders verified high-risk metadata`, async ({ page }) => {
      await openCase(page, componentCase.slug);

      const block = page.locator('.showcase-block').filter({ hasText: componentCase.title }).first();
      await expect(block).toBeVisible();
      await expect(block.locator('.case-title')).toHaveText(componentCase.title);
      await expect(block.locator('.status-badge')).toHaveText('已验证');
      await expect(block.locator('.risk-badge')).toHaveText('高风险');
      for (const riskNote of componentCase.riskNotes) {
        await expect(block.getByText(riskNote)).toBeVisible();
      }
      await expect(block.getByText('当前组件暂无展示内容')).toBeHidden();
    });
  }

  test('picker opens and confirms from the showcase demo', async ({ page }) => {
    await openCase(page, 'picker');

    await page.getByText('选择颜色').click();
    await expect(page.locator('.lk-picker').first()).toBeVisible();
    await expect(page.getByText('请选择颜色')).toBeVisible();

    await page.locator('.lk-picker__btn--confirm').first().click();
    await expect(page.locator('.lk-picker').first()).toBeHidden();
  });

  test('tooltip click trigger displays positioned content', async ({ page }) => {
    await openCase(page, 'tooltip');

    await page.getByText('点击看看').click();
    const tooltip = page.locator('.lk-tooltip__pop').filter({ hasText: '点击触发' }).first();
    await expect(tooltip).toBeVisible();
    await expect(tooltip.locator('.lk-tooltip__arrow')).toBeVisible();
  });

  test('waterfall lays out cards and keeps cards after scrolling', async ({ page }) => {
    await openCase(page, 'waterfall');

    const cards = page.locator('.lk-waterfall__card');
    await expect.poll(async () => cards.count()).toBeGreaterThan(0);

    const beforeCount = await cards.count();
    await page.locator('.lk-waterfall__scroll').evaluate(element => {
      element.scrollTop = 480;
      element.dispatchEvent(new Event('scroll'));
    });

    await expect.poll(async () => cards.count()).toBeGreaterThanOrEqual(beforeCount);
  });

  test('tabbar-container switches dynamic tab content', async ({ page }) => {
    await openCase(page, 'tabbar-container');

    const paneTitle = page.locator('.tabbar-preview-pane__title');
    await expect(paneTitle.filter({ hasText: '发现灵感' }).first()).toBeVisible();

    await page.getByText('购物车').first().click();
    await expect(paneTitle.filter({ hasText: '购物车' }).first()).toBeVisible();
  });

  test('tabbar-container supports low-risk slot render mode', async ({ page }) => {
    await openCase(page, 'tabbar-container');

    const shell = page.locator('.tabbar-safe-shell').first();
    const container = shell.locator('.lk-tabbar-container').first();
    await expect(container).toHaveClass(/is-static-tabbar/);
    await expect(container).toHaveClass(/is-safe-mode/);
    await expect(container).toHaveClass(/lk-tabbar-container--render-slot/);
    await expect(shell.locator('.lk-tabbar-container__placeholder')).toBeHidden();
    await expect
      .poll(async () =>
        shell.locator('.lk-tabbar-container__tabbar').evaluate(element => {
          return window.getComputedStyle(element).position;
        })
      )
      .toBe('relative');

    await shell.getByText('Cart').click();
    await expect(shell.locator('.tabbar-preview-pane__title').filter({ hasText: '购物车' }).first()).toBeVisible();
  });
});
