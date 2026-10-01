import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import { pageUrlSegmentPattern } from '@content-config';
import { isVisible } from '@utils/content';

export type Page = CollectionEntry<'pages'>;

export interface GetPagesOptions {
  filterByStatus?: boolean;
}

const PAGES_DIR = 'src/content/pages/';

/**
 * Fetches and filters pages based on status and environment
 * In production, only published/archived pages are returned
 * In development, all pages are returned (for previewing)
 * @param options - Configuration options
 * @returns Filtered pages
 */
export async function getPages(options?: GetPagesOptions): Promise<Page[]> {
  const allPages = await getCollection('pages');
  const shouldFilter = options?.filterByStatus ?? true;

  if (shouldFilter) {
    return allPages.filter((page) => isVisible(page));
  }

  return allPages;
}

/**
 * Resolves the URL path a page is served at, without leading or trailing slash.
 *
 * The path is the folders the file sits in under src/content/pages, followed by the
 * page's permalink: `data/docs/bq/schema.yaml` with `permalink: schema` is served at
 * `data/docs/bq/schema`. The file's own name plays no part.
 *
 * @param page - A pages collection entry
 * @returns The URL path (e.g. "about" or "data/docs/bq/schema")
 * @throws If the page sits in a folder whose name is not a web-safe URL segment
 */
export function getPagePath(page: Page): string {
  const filePath = page.filePath ?? '';
  if (!filePath.startsWith(PAGES_DIR)) {
    throw new Error(`pages: cannot resolve the folder of page "${page.id}" (filePath: "${filePath}").`);
  }

  const folders = filePath.slice(PAGES_DIR.length).split('/').slice(0, -1);
  const invalid = folders.find((folder) => !pageUrlSegmentPattern.test(folder));
  if (invalid !== undefined) {
    throw new Error(
      `pages: "${filePath}" is inside the folder "${invalid}", which cannot be used in a URL. ` +
        `Folder names become part of the page URL, so use only letters, numbers, hyphens and underscores.`
    );
  }

  return [...folders, page.data.permalink].join('/');
}
