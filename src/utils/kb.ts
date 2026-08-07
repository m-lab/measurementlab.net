import { type CollectionEntry, getCollection } from 'astro:content';
import { isVisible } from '@utils/content';

export type KbEntry = CollectionEntry<'kb'>;

export interface KbChapter {
  name: string;
  order: number;
  pages: KbEntry[];
}

/**
 * All visible knowledge base articles in reading order: chapter first, then
 * position within it.
 *
 * This single ordering backs the sidebar, the prev/next links and the default
 * order on the /kb landing page, so every one of them agrees on what "the next
 * article" is.
 */
export async function getPublishedKbArticles(): Promise<KbEntry[]> {
  const articles = await getCollection('kb');

  return articles
    .filter((article) => isVisible(article))
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
 * Group the visible articles into chapters, preserving reading order.
 *
 * A chapter takes its order from the first article that names it. Articles of
 * one chapter are already adjacent after getPublishedKbArticles(), so the
 * insertion order of the map is the chapter order.
 */
export async function getKbChapters(): Promise<KbChapter[]> {
  const articles = await getPublishedKbArticles();
  const chapterMap = new Map<string, KbChapter>();

  for (const article of articles) {
    const existing = chapterMap.get(article.data.chapter);
    if (existing) {
      existing.pages.push(article);
    } else {
      chapterMap.set(article.data.chapter, {
        name: article.data.chapter,
        order: article.data.chapterOrder,
        pages: [article],
      });
    }
  }

  return Array.from(chapterMap.values()).sort((a, b) => a.order - b.order);
}

/** Prev/next neighbours of an article in reading order. */
export async function getKbNavigation(currentPermalink: string): Promise<{
  prev: KbEntry | null;
  next: KbEntry | null;
}> {
  const articles = await getPublishedKbArticles();
  const index = articles.findIndex(
    (a) => a.data.permalink === currentPermalink
  );

  if (index === -1) return { prev: null, next: null };

  return {
    prev: index > 0 ? articles[index - 1] : null,
    next: index < articles.length - 1 ? articles[index + 1] : null,
  };
}

export function getKbUrl(article: KbEntry): string {
  return `/kb/${article.data.permalink}`;
}

/**
 * Shape the landing page's filterable grid consumes. Kept deliberately flat and
 * serialisable — it crosses the island boundary into React, where Astro content
 * entries themselves would not survive.
 */
export interface KbCardData {
  permalink: string;
  title: string;
  description?: string;
  chapter: string;
  chapterOrder: number;
  order: number;
  /** Written-out tag names, e.g. "Core Services" — see categories/kb.json. */
  tags: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published' | 'archived';
}

export async function getKbCardData(): Promise<KbCardData[]> {
  const articles = await getPublishedKbArticles();

  return articles.map((article) => ({
    permalink: article.data.permalink,
    title: article.data.title,
    description: article.data.description,
    chapter: article.data.chapter,
    chapterOrder: article.data.chapterOrder,
    order: article.data.order,
    tags: article.data.tags ?? [],
    difficulty: article.data.difficulty,
    status: article.data.status,
  }));
}
