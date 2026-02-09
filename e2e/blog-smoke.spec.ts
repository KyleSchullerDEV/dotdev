import { test, expect } from "@playwright/test";

test.describe("Public blog smoke test", () => {
  test("can navigate from homepage to blog listing", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Kyle Schuller/);

    // Verify homepage content
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Navigate to blog listing via nav
    await page.getByRole("link", { name: /blog/i }).first().click();
    await expect(page).toHaveURL("/blog");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Blog");
  });

  test("can navigate to a blog post if posts exist", async ({ page }) => {
    await page.goto("/blog");

    const firstPost = page.getByRole("article").first();
    if (await firstPost.isVisible({ timeout: 5000 }).catch(() => false)) {
      const postLink = firstPost.getByRole("link").first();
      await postLink.click();

      await expect(page).toHaveURL(/\/blog\/.+/);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.locator(".prose")).toBeVisible();
    }
  });

  test("shows 404 for non-existent post", async ({ page }) => {
    await page.goto("/blog/this-post-does-not-exist-xyz");
    await expect(page.getByText(/not found/i)).toBeVisible();
  });

  test("homepage has correct accessibility landmarks", async ({ page }) => {
    await page.goto("/");

    // Skip link exists
    const skipLink = page.getByRole("link", { name: /skip to content/i });
    await expect(skipLink).toBeAttached();

    // Main landmark
    await expect(page.getByRole("main")).toBeVisible();

    // Header landmark
    await expect(page.getByRole("banner")).toBeVisible();

    // Footer landmark
    await expect(page.getByRole("contentinfo")).toBeVisible();

    // Single H1
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
