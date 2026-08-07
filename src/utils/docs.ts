import { type CollectionEntry, getCollection } from 'astro:content';
import { isVisible } from '@utils/content';

export type DocEntry = CollectionEntry<'docs'>;

export interface DocChapter {
  name: string;
  order: number;
  pages: DocEntry[];
}

/**
 * All visible docs in reading order: chapter first, then position within it.
 *
 * This single ordering backs the sidebar, the prev/next links and the /docs
 * landing redirect, so every one of them agrees on what "the next page" is.
 */
export async function getPublishedDocs(): Promise<DocEntry[]> {
  const docs = await getCollection('docs');

  return docs
    .filter((doc) => isVisible(doc))
    .sort((a, b) => {
      if (a.data.chapterOrder !== b.data.chapterOrder) {
        return a.data.chapterOrder - b.data.chapterOrder;
      }
      if (a.data.order !== b.data.order) {
        return a.data.order - b.data.order;
      }
      // Same chapter and same order number: fall back to title so the sidebar
      // does not reshuffle between builds.
      return a.data.title.localeCompare(b.data.title);
    });
}

/**
 * Group the visible docs into chapters, preserving reading order.
 *
 * A chapter takes its order from the first page that names it. Pages of one
 * chapter are already adjacent after getPublishedDocs(), so the insertion
 * order of the map is the chapter order.
 */
export async function getDocChapters(): Promise<DocChapter[]> {
  const docs = await getPublishedDocs();
  const chapterMap = new Map<string, DocChapter>();

  for (const doc of docs) {
    const existing = chapterMap.get(doc.data.chapter);
    if (existing) {
      existing.pages.push(doc);
    } else {
      chapterMap.set(doc.data.chapter, {
        name: doc.data.chapter,
        order: doc.data.chapterOrder,
        pages: [doc],
      });
    }
  }

  return Array.from(chapterMap.values()).sort((a, b) => a.order - b.order);
}

/** The page /docs redirects to. Undefined when nothing is visible. */
export async function getFirstDocPage(): Promise<DocEntry | undefined> {
  const docs = await getPublishedDocs();
  return docs[0];
}

/** Prev/next neighbours of a doc in reading order. */
export async function getDocNavigation(currentPermalink: string): Promise<{
  prev: DocEntry | null;
  next: DocEntry | null;
}> {
  const docs = await getPublishedDocs();
  const index = docs.findIndex((d) => d.data.permalink === currentPermalink);

  if (index === -1) return { prev: null, next: null };

  return {
    prev: index > 0 ? docs[index - 1] : null,
    next: index < docs.length - 1 ? docs[index + 1] : null,
  };
}

export function getDocUrl(doc: DocEntry): string {
  return `/docs/${doc.data.permalink}`;
}
