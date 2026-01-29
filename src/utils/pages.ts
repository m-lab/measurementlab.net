import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import { isDev } from '@utils/dev';

export type Page = CollectionEntry<'pages'>;

export interface GetPagesOptions {
  filterUnpublished?: boolean;
}

/**
 * Fetches and filters pages based on environment
 * In production, only published pages are returned
 * In development, all pages are returned (for previewing)
 * @param options - Configuration options
 * @returns Filtered pages
 */
export async function getPages(options?: GetPagesOptions): Promise<Page[]> {
  const allPages = await getCollection('pages');
  const shouldFilterUnpublished = options?.filterUnpublished ?? !isDev;

  if (shouldFilterUnpublished) {
    return allPages.filter((page) => page.data.published !== false);
  }

  return allPages;
}
