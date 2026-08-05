import { type CollectionEntry, getCollection } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { isVisible } from '@utils/content';

export type Test = CollectionEntry<'tests'>;

export interface TestCardData {
  test: Test;
  optimizedIcon?: ImageMetadata;
}

export interface GetTestsOptions {
  includeHidden?: boolean;
  testStatus?: Test['data']['testStatus'];
}

/**
 * Get all tests sorted by order, then alphabetically by title
 * @param options - Configuration options
 * @returns Filtered and sorted tests
 */
export async function getTests(options?: GetTestsOptions): Promise<Test[]> {
  const allTests = await getCollection('tests');

  let filtered = allTests.filter((test) => isVisible(test));

  if (!options?.includeHidden) {
    filtered = filtered.filter((test) => test.data.showInIndex !== false);
  }

  if (options?.testStatus) {
    filtered = filtered.filter((test) => test.data.testStatus === options.testStatus);
  }

  return filtered.sort((a, b) => {
    // First sort by order
    const orderA = a.data.order ?? 999;
    const orderB = b.data.order ?? 999;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    // Then sort alphabetically by title
    return a.data.title.localeCompare(b.data.title);
  });
}

/**
 * Get hand-picked tests by permalink, preserving the order they were selected in.
 *
 * Unlike getTests(), this includes tests marked `showInIndex: false` — an editor
 * naming a test explicitly means to show it, and that flag only governs the
 * automatic /tests listing. Drafts are still filtered out by isVisible().
 *
 * @param permalinks - Test permalinks (e.g. "/tests/ndt/")
 * @returns Matching tests in selection order; unresolved permalinks are skipped
 */
export async function getTestsByPermalinks(permalinks: string[]): Promise<Test[]> {
  if (!permalinks?.length) return [];

  const allTests = await getTests({ includeHidden: true });

  return permalinks
    .map((permalink) => {
      const test = allTests.find((t) => t.data.permalink === permalink);
      if (!test) {
        console.warn(`Test not found or not visible: ${permalink}`);
      }
      return test;
    })
    .filter((test): test is Test => test !== undefined);
}
