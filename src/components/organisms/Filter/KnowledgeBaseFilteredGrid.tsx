import KnowledgeBaseCard from '@components/organisms/KnowledgeBase/KnowledgeBaseCard';
import { Input } from '@headlessui/react';
import type { KbCardData } from '@utils/kb';
import Fuse from 'fuse.js';
import { useMemo, useState } from 'react';
import MagnifyingGlassIcon from '~icons/heroicons/magnifying-glass-20-solid';
import XMarkIcon from '~icons/heroicons/x-mark-20-solid';
import FilterDropdown from './FilterDropdown';

const DIFFICULTY_RANK: Record<string, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

interface Props {
  articles: KbCardData[];
  markDrafts?: boolean;
}

export default function KnowledgeBaseFilteredGrid({
  articles,
  markDrafts = false,
}: Props) {
  const [searchText, setSearchText] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [chapters, setChapters] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<string[]>([]);

  // const hasFiltersSet =
  //   !!searchText || !!chapters.length || !!tags.length || !!difficulties.length;

  // Chapter options stay in reading order rather than alphabetical — the
  // dropdown then mirrors the sidebar on the article pages. Articles arrive
  // pre-sorted by getKbCardData(), so first-seen is reading order.
  const chapterOptions = useMemo(() => {
    const seen: string[] = [];
    for (const a of articles) {
      if (!seen.includes(a.chapter)) seen.push(a.chapter);
    }
    return seen;
  }, [articles]);

  const tagOptions = useMemo(
    () => Array.from(new Set(articles.flatMap((a) => a.tags))).sort(),
    [articles]
  );

  const difficultyOptions = useMemo(
    () =>
      Array.from(
        new Set(articles.map((a) => a.difficulty).filter(Boolean) as string[])
      ).sort((a, b) => DIFFICULTY_RANK[a] - DIFFICULTY_RANK[b]),
    [articles]
  );

  const fuse = useMemo(
    () =>
      new Fuse(articles, {
        keys: [
          { name: 'title', weight: 2 },
          { name: 'description', weight: 1 },
          { name: 'tags', weight: 1 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [articles]
  );

  const visible = useMemo(() => {
    // Fuse orders by relevance; the sort below discards that. Reading order is
    // the only order this page offers, so match score must not disturb it.
    let results = searchText
      ? fuse.search(searchText).map((r) => r.item)
      : articles;

    if (chapters.length) {
      results = results.filter((a) => chapters.includes(a.chapter));
    }
    if (difficulties.length) {
      results = results.filter(
        (a) => a.difficulty && difficulties.includes(a.difficulty)
      );
    }
    if (tags.length) {
      results = results.filter((a) => a.tags.some((t) => tags.includes(t)));
    }

    return [...results].sort(
      (a, b) => a.chapterOrder - b.chapterOrder || a.order - b.order
    );
  }, [articles, fuse, searchText, chapters, tags, difficulties]);

  const groups = useMemo(() => {
    const byChapter = new Map<string, KbCardData[]>();
    for (const article of visible) {
      const existing = byChapter.get(article.chapter);
      if (existing) existing.push(article);
      else byChapter.set(article.chapter, [article]);
    }
    return Array.from(byChapter, ([name, items]) => ({ name, items }));
  }, [visible]);

  // const clearAll = () => {
  //   setSearchText('');
  //   setChapters([]);
  //   setTags([]);
  //   setDifficulties([]);
  // };

  return (
    <div>
      {/* Filter bar — mirrors Filter/FilterBar so /kb reads as part of the site */}
      <div className="bg-neutral-900 px-6 py-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-stretch gap-4 md:flex-row md:items-center md:gap-6">
          <div className="flex-1">
            <FilterDropdown
              label="chapter"
              options={chapterOptions}
              value={chapters}
              onChange={(v) => setChapters(v as string[])}
              multiple
            />
          </div>
          <div className="flex-1">
            <FilterDropdown
              label="tags"
              options={tagOptions}
              value={tags}
              onChange={(v) => setTags(v as string[])}
              multiple
            />
          </div>
          <div className="flex-1">
            <FilterDropdown
              label="difficulty"
              options={difficultyOptions}
              value={difficulties}
              onChange={(v) => setDifficulties(v as string[])}
              multiple
            />
          </div>

          <div className="ml-auto flex items-center space-x-2">
            <div
              className={`relative flex items-center overflow-hidden transition-all duration-300 ease-in-out ${
                isSearchExpanded ? 'w-64' : 'w-0'
              }`}
            >
              <Input
                type="text"
                aria-label="Search the knowledge base"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search"
                className={`w-full border-y-4 border-t-transparent border-b-neutral-300 bg-neutral-200 px-3 py-2 pr-12 pl-10 text-neutral-700 placeholder-neutral-700 transition-opacity duration-300 ease-in-out focus:border-b-primary-600 focus:outline-none ${
                  isSearchExpanded
                    ? 'opacity-100'
                    : 'pointer-events-none opacity-0'
                }`}
                autoFocus={isSearchExpanded}
              />
              {isSearchExpanded && (
                <MagnifyingGlassIcon
                  className="pointer-events-none absolute left-3 h-5 w-5 text-neutral-700"
                  aria-hidden="true"
                />
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="button-primary flex h-12 w-12 cursor-pointer items-center justify-center transition-opacity duration-300"
              aria-label={isSearchExpanded ? 'Close search' : 'Expand search'}
            >
              {isSearchExpanded ? (
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Result count and reset */}
      {/* <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-6 pt-8">
        <p className="text-sm text-neutral-600">
          {visible.length} {visible.length === 1 ? 'article' : 'articles'}
          {hasFiltersSet ? ` of ${articles.length}` : ''}
        </p>
        {hasFiltersSet && (
          <button
            type="button"
            onClick={clearAll}
            className="cursor-pointer text-sm text-primary-600 underline underline-offset-2 hover:text-primary-800"
          >
            Clear filters
          </button>
        )}
      </div> */}

      <div className="mx-auto max-w-7xl px-6 py-8">
        {groups.length > 0 ? (
          groups.map((group) => (
            <section key={group.name} className="mb-12 last:mb-0">
              <h2 className="mb-6 border-b border-neutral-200 pb-2 text-2xl font-bold text-neutral-900">
                {group.name}
              </h2>
              <ul className="grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2 lg:grid-cols-3">
                {group.items.map((article) => (
                  <li key={article.permalink} className="flex">
                    <KnowledgeBaseCard
                      article={article}
                      markDraft={markDrafts}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))
        ) : (
          <div className="py-12 text-center">
            <p className="text-lg text-neutral-600">
              No articles match your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
