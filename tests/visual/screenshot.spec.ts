import { expect, test } from '@playwright/test';
import { SHOWCASE_CASES } from '../../src/components/showcase/showcase-cases';

const VISUAL_CASES = SHOWCASE_CASES.filter(item => item.visualEnabled);

const getShowcaseUrl = (slug: string) => `/?component=${slug}#/pages_sub/showcase/index?component=${slug}`;

for (const componentCase of VISUAL_CASES) {
  test(`截图对比 - ${componentCase.slug}`, async ({ page }) => {
    /**
     * 进入统一展示页，通过 query 标记当前截图组件。
     * 注意事项：showcase 页面应确保每次渲染稳定。
     */
    await page.goto(getShowcaseUrl(componentCase.slug));
    await page.waitForLoadState('networkidle');
    await page.setViewportSize({ width: 390, height: 844 });

    await expect(page).toHaveScreenshot(`${componentCase.slug}.png`);
  });
}
