import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import { isVisible } from '@utils/content';

export type Page = CollectionEntry<'pages'>;

export interface GetPagesOptions {
  filterByStatus?: boolean;
}

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
