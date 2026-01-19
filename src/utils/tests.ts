import { getCollection, type CollectionEntry } from 'astro:content';
import { getImage, type ImageMetadata } from 'astro:assets';

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
 * Status display labels
 */
export const statusLabels: Record<NonNullable<Test['data']['status']>, string> = {
  current: 'Current',
  'core-service': 'Core Service',
  retired: 'Retired',
  'retired-core-service': 'Retired Core Service',
};

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

/**
 * Prepare test data for card rendering
 * @param test - The test
 * @returns Data ready for card rendering
 */
export async function prepareTestCardData(test: Test): Promise<TestCardData> {
  let optimizedIcon: ImageMetadata | undefined;

  if (test.data.icon) {
    try {
      const optimized = await getImage({ src: test.data.icon, width: 96 });
      optimizedIcon = optimized as ImageMetadata;
    } catch (e) {
      // Icon optimization failed, will use original or skip
    }
  }

  return {
    test,
    optimizedIcon,
  };
}

/**
 * Prepare multiple tests for card rendering (more efficient)
 * @param tests - Array of tests
 * @returns Array of data ready for card rendering
 */
export async function prepareTestsCardData(tests: Test[]): Promise<TestCardData[]> {
  return Promise.all(tests.map((test) => prepareTestCardData(test)));
}
