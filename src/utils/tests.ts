import { type CollectionEntry, getCollection } from 'astro:content';
import type { ImageMetadata } from 'astro';

export type Test = CollectionEntry<'tests'>;

export interface TestCardData {
  test: Test;
  optimizedIcon?: ImageMetadata;
}

export interface GetTestsOptions {
  includeHidden?: boolean;
  status?: Test['data']['status'];
}

/**
 * Get all tests sorted by order, then alphabetically by title
 * @param options - Configuration options
 * @returns Filtered and sorted tests
 */
export async function getTests(options?: GetTestsOptions): Promise<Test[]> {
  const allTests = await getCollection('tests');

  let filtered = options?.includeHidden
    ? allTests
    : allTests.filter((test) => test.data.showInIndex !== false);

  if (options?.status) {
    filtered = filtered.filter((test) => test.data.status === options.status);
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
