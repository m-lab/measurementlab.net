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

// The file that stands for its folder: data/docs/index.yaml is the /data/docs page, and
// the other files in data/docs are its children. Keep in sync with `view.node.filename`
// of the pages collection in .pages.yml, which is what makes Pages CMS show the tree.
const NODE_FILENAME = 'index.yaml';

/**
 * Resolves the URL path a page is served at, without leading or trailing slash.
 *
 * The path is the folders the file sits in under src/content/pages, followed by the
 * page's permalink: `data/docs/bq/schema.yaml` with `permalink: schema` is served at
 * `data/docs/bq/schema`. The file's own name plays no part, with one exception: an
 * `index.yaml` is the page for its folder, so `data/docs/index.yaml` is served at
 * `data/docs`.
 *
 * @param page - A pages collection entry
 * @returns The URL path (e.g. "about" or "data/docs/bq/schema")
 * @throws If the page sits in a folder whose name is not a web-safe URL segment, or if
 *   an `index.yaml` has a permalink that differs from its folder's name
 */
export function getPagePath(page: Page): string {
  const filePath = page.filePath ?? '';
  if (!filePath.startsWith(PAGES_DIR)) {
    throw new Error(`pages: cannot resolve the folder of page "${page.id}" (filePath: "${filePath}").`);
  }

  const segments = filePath.slice(PAGES_DIR.length).split('/');
  const fileName = segments[segments.length - 1];
  const folders = segments.slice(0, -1);
  const invalid = folders.find((folder) => !pageUrlSegmentPattern.test(folder));
  if (invalid !== undefined) {
    throw new Error(
      `pages: "${filePath}" is inside the folder "${invalid}", which cannot be used in a URL. ` +
        `Folder names become part of the page URL, so use only lowercase letters, numbers and hyphens.`
    );
  }

  if (fileName === NODE_FILENAME && folders.length > 0) {
    // The children take their URL from the folder name, so a different permalink here
    // would serve the parent at one URL and its children under another.
    const folder = folders[folders.length - 1];
    if (page.data.permalink !== folder) {
      throw new Error(
        `pages: "${filePath}" has the permalink "${page.data.permalink}", but it is the page for the folder "${folder}" ` +
          `and its child pages are served under /${folders.join('/')}/. Set the permalink to "${folder}", or rename the folder.`
      );
    }
    return folders.join('/');
  }

  return [...folders, page.data.permalink].join('/');
}
