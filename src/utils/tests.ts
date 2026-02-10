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
