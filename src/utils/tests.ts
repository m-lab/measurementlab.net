import { type CollectionEntry, getCollection } from 'astro:content';
import { isVisible } from '@utils/content';
import type { ImageMetadata } from 'astro';
import testKinds from '../content/categories/test-kind.json';
import testStatuses from '../content/categories/test-status.json';

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

// ---------------------------------------------------------------------------
// Kind + status badges
//
// The two value lists live in src/content/categories/test-kind.json and
// test-status.json: the Zod enums, the Pages CMS dropdowns (via
// scripts/sync-pages-categories.mjs) and the labels below all read from them.
// Only the colours are decided here: one for every kind, one per status. Adding a
// kind is a JSON edit alone; adding a status also needs a colour below, and the
// build fails if it is missing.
// ---------------------------------------------------------------------------

const KIND_BADGE_STYLE = 'bg-primary-100 text-primary-800';
const statusBadgeStyles: Record<string, string> = {
  current: 'bg-neutral-600 text-white',
  retired: 'bg-neutral-100 text-neutral-800',
};

for (const status of testStatuses.categories) {
  if (!(status.id in statusBadgeStyles)) {
    throw new Error(
      `src/utils/tests.ts: no badge style for test status "${status.id}" (add it to statusBadgeStyles)`
    );
  }
}

const kindLabels = Object.fromEntries(testKinds.categories.map((c) => [c.id, c.name]));
const statusLabels = Object.fromEntries(testStatuses.categories.map((c) => [c.id, c.name]));

export interface TestBadge {
  label: string;
  className: string;
}

/**
 * Badges for a test's detail page: the kind first ("Test", "Core Service",
 * "Analysis System"), then the status ("Current", "Retired") when one is set.
 */
export function getTestBadges(data: Test['data']): TestBadge[] {
  const { kind, testStatus } = data;
  const badges: TestBadge[] = [{ label: kindLabels[kind], className: KIND_BADGE_STYLE }];
  if (testStatus) {
    badges.push({ label: statusLabels[testStatus], className: statusBadgeStyles[testStatus] });
  }
  return badges;
}
