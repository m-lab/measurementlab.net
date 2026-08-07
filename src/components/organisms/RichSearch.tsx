import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Dialog,
  DialogBackdrop,
  DialogPanel,
} from '@headlessui/react';
import Fuse, { type FuseResult } from 'fuse.js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AcademicCapIcon from '~icons/heroicons/academic-cap';
import BookOpenIcon from '~icons/heroicons/book-open';
import ChevronRightIcon from '~icons/heroicons/chevron-right-16-solid';
import DocumentIcon from '~icons/heroicons/document-text';
import ExclamationTriangleIcon from '~icons/heroicons/exclamation-triangle';
import FolderIcon from '~icons/heroicons/folder';
import LifebuoyIcon from '~icons/heroicons/lifebuoy';
import MagnifyingGlassIcon from '~icons/heroicons/magnifying-glass-20-solid';
import UserIcon from '~icons/heroicons/user';

type SearchResult = {
  id: string;
  name: string;
  url: string;
  category: string;
  imageUrl?: string;
  content?: string;
};

// Type for unplugin-icons components which use 'class' instead of 'className'
type IconComponent = React.ComponentType<{
  class?: string;
  'aria-hidden'?: 'true' | 'false';
}>;

type CategoryConfig = {
  name: string;
  apiEndpoint: string;
  urlPrefix: string;
  icon: IconComponent;
  modifier: string;
  transform: (item: any) => Omit<SearchResult, 'category'>;
};

// Strip markdown/MDX syntax to produce plaintext for search indexing
function stripMarkdown(text: string): string {
  return text
    .replace(/^import\s+.*$/gm, '') // MDX imports
    .replace(/^export\s+.*$/gm, '') // MDX exports
    .replace(/<[^>]+>/g, '') // HTML/JSX tags
    .replace(/```[\s\S]*?```/g, '') // fenced code blocks
    .replace(/`([^`]*)`/g, '$1') // inline code
    .replace(/!\[.*?\]\(.*?\)/g, '') // images
    .replace(/\[([^\]]*)\]\(.*?\)/g, '$1') // links → keep text
    .replace(/^#{1,6}\s+/gm, '') // headings
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // italic
    .replace(/^\s*[-*+]\s+/gm, '') // unordered list markers
    .replace(/^\s*\d+\.\s+/gm, '') // ordered list markers
    .replace(/^>\s+/gm, '') // blockquotes
    .replace(/---+/g, '') // horizontal rules
    .replace(/\n{2,}/g, ' ') // collapse blank lines
    .replace(/\s+/g, ' ') // normalize whitespace
    .trim();
}

// Configuration for search categories
const SEARCH_CATEGORIES: CategoryConfig[] = [
  {
    name: 'Pages',
    apiEndpoint: '/api/pages.json',
    urlPrefix: '/',
    icon: FolderIcon,
    modifier: '#',
    transform: (page: any) => {
      const parts: string[] = [];
      if (page.description) parts.push(page.description);
      if (page.sections) {
        page.sections
          .filter((s: any) => s.type === 'richText' && s.content)
          .forEach((s: any) => {
            parts.push(s.content);
          });
      }
      return {
        id: page.id,
        name: page.title,
        url: `/${page.permalink}`,
        imageUrl: page.heroImage?.src,
        content:
          parts.length > 0
            ? stripMarkdown(parts.join(' ')).slice(0, 2000)
            : undefined,
      };
    },
  },
  {
    name: 'People',
    apiEndpoint: '/api/people.json',
    urlPrefix: '/people/',
    icon: UserIcon,
    modifier: '>',
    transform: (person: any) => ({
      id: person.id,
      name: person.name,
      url: `/people/${person.id}`,
      imageUrl: person.headshot?.src,
    }),
  },
  {
    name: 'Blog',
    apiEndpoint: '/api/blog.json',
    urlPrefix: '/blog/',
    icon: DocumentIcon,
    modifier: '@',
    transform: (post: any) => {
      const parts: string[] = [];
      if (post.data.excerpt) parts.push(post.data.excerpt);
      if (post.body) parts.push(post.body);
      return {
        id: post.id,
        name: post.data.title,
        url: `/blog/${post.id}`,
        imageUrl: post.data.heroImage?.src,
        content:
          parts.length > 0
            ? stripMarkdown(parts.join(' ')).slice(0, 2000)
            : undefined,
      };
    },
  },
  {
    name: 'Knowledge Base',
    apiEndpoint: '/api/kb.json',
    urlPrefix: '/kb/',
    icon: BookOpenIcon,
    modifier: '!',
    transform: (article: any) => {
      const parts: string[] = [];
      if (article.data.description) parts.push(article.data.description);
      if (article.data.tags?.length) parts.push(article.data.tags.join(' '));
      if (article.body) parts.push(article.body);
      return {
        id: `kb-${article.id}`,
        name: article.data.title,
        // The route is keyed on `permalink`, not the file id — they match today
        // but the schema does not force it.
        url: `/kb/${article.data.permalink}`,
        imageUrl: undefined,
        content:
          parts.length > 0
            ? stripMarkdown(parts.join(' ')).slice(0, 2000)
            : undefined,
      };
    },
  },
  {
    name: 'Publications',
    apiEndpoint: '/api/publications.json',
    urlPrefix: '/publications/',
    icon: AcademicCapIcon,
    modifier: '$',
    transform: (pub: any) => ({
      id: pub.id,
      name: pub.title,
      url: `/publications/${pub.id}`,
      imageUrl: undefined, // Publications don't have hero images
      content: pub.description || undefined,
    }),
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

type Snippet = { before: string; match: string; after: string };

// Extract a snippet of ~80 chars around the first content match
function getMatchSnippet(
  result: FuseResult<SearchResult>,
  queryStr: string
): Snippet | null {
  const text = result.item.content;
  if (!text) return null;

  // Prefer exact substring match — most meaningful for the user
  const idx = text.toLowerCase().indexOf(queryStr.toLowerCase());
  if (idx !== -1) {
    const snippetStart = Math.max(0, idx - 40);
    const snippetEnd = Math.min(text.length, idx + queryStr.length + 40);
    return {
      before: `${snippetStart > 0 ? '...' : ''}${text.slice(snippetStart, idx)}`,
      match: text.slice(idx, idx + queryStr.length),
      after: `${text.slice(idx + queryStr.length, snippetEnd)}${snippetEnd < text.length ? '...' : ''}`,
    };
  }

  // Fallback: use the longest Fuse match index (skips trivial single-char hits)
  const contentMatch = result.matches?.find(
    (m: { key?: string }) => m.key === 'content'
  );
  if (contentMatch?.indices?.length) {
    const longest = contentMatch.indices.reduce((best, cur) =>
      cur[1] - cur[0] > best[1] - best[0] ? cur : best
    );
    const [start, end] = longest;
    const snippetStart = Math.max(0, start - 40);
    const snippetEnd = Math.min(text.length, end + 1 + 40);
    return {
      before: `${snippetStart > 0 ? '...' : ''}${text.slice(snippetStart, start)}`,
      match: text.slice(start, end + 1),
      after: `${text.slice(end + 1, snippetEnd)}${snippetEnd < text.length ? '...' : ''}`,
    };
  }

  return null;
}

export default function RichSearch() {
  const [open, setOpen] = useState(false);
  const [rawQuery, setRawQuery] = useState('');
  const [debouncedRawQuery, setDebouncedRawQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Debounce the query to avoid running Fuse on every keystroke
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const updateDebouncedQuery = useCallback((value: string) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedRawQuery(value), 150);
  }, []);
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const query = debouncedRawQuery.toLowerCase().replace(/^[#>@$]/, '');

  const hasFetched = useRef(false);

  // Fetch data dynamically from all configured categories
  useEffect(() => {
    if (!open || hasFetched.current) return;
    hasFetched.current = true;

    async function fetchSearchData() {
      setLoading(true);
      try {
        // Fetch site config for default image and all category endpoints
        const responses = await Promise.all([
          fetch('/api/site.json'),
          ...SEARCH_CATEGORIES.map((category) => fetch(category.apiEndpoint)),
        ]);

        const [siteData, ...categoryDataArrays] = await Promise.all(
          responses.map((res) => res.json())
        );

        // Extract default OG image from site config
        const siteConfig = siteData[0]; // site collection returns array with single item
        const defaultImageUrl = siteConfig?.defaultOgImage?.src;

        // Transform and combine results from all categories
        const searchResults: SearchResult[] = [];

        categoryDataArrays.forEach((data, index) => {
          const category = SEARCH_CATEGORIES[index];
          const items = data
            // Filter out unpublished blog posts if applicable
            .filter((item: any) =>
              category.name === 'Blog'
                ? item.data?.status === 'published'
                : true
            )
            .map((item: any) => {
              const transformed = category.transform(item);
              // Use hero image if available, otherwise use default
              const imageUrl = transformed.imageUrl || defaultImageUrl;
              return {
                ...transformed,
                imageUrl,
                category: category.name,
              };
            });

          searchResults.push(...items);
        });

        setResults(searchResults);
      } catch (error) {
        console.error('Failed to fetch search data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSearchData();
  }, [open]);

  // Open/close event listener
  useEffect(() => {
    const handleOpenSearch = () => {
      setOpen(true);
    };

    window.addEventListener('open-search', handleOpenSearch);

    return () => {
      window.removeEventListener('open-search', handleOpenSearch);
    };
  }, []);

  // Memoize Fuse instances per category — rebuilt only when results change
  const fuseInstancesRef = useRef<Record<string, Fuse<SearchResult>>>({});
  const prevResultsRef = useRef<SearchResult[]>([]);

  if (results !== prevResultsRef.current) {
    prevResultsRef.current = results;
    const instances: Record<string, Fuse<SearchResult>> = {};
    SEARCH_CATEGORIES.forEach((category) => {
      const categoryResults = results.filter(
        (r) => r.category === category.name
      );
      instances[category.name] = new Fuse(categoryResults, {
        keys: [
          { name: 'name', weight: 2 },
          { name: 'content', weight: 1 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
        includeMatches: true,
        includeScore: true,
        minMatchCharLength: 3,
      });
    });
    fuseInstancesRef.current = instances;
  }

  // Dynamically filter results for each category, with content match snippets
  const { filteredResultsByCategory, snippets } = useMemo(() => {
    const filtered: Record<string, SearchResult[]> = {};
    const newSnippets: Record<string, Snippet> = {};

    SEARCH_CATEGORIES.forEach((category) => {
      const categoryResults = results.filter(
        (r) => r.category === category.name
      );

      // If modifier is used, show all items from that category
      if (debouncedRawQuery === category.modifier) {
        filtered[category.name] = categoryResults;
        return;
      }

      // If query is empty or another modifier is active, show nothing
      const otherModifiers = SEARCH_CATEGORIES.filter(
        (c) => c.modifier !== category.modifier
      ).map((c) => c.modifier);

      if (
        query === '' ||
        otherModifiers.some((mod) => debouncedRawQuery.startsWith(mod))
      ) {
        filtered[category.name] = [];
        return;
      }

      // Use memoized Fuse instance for fuzzy search with content
      const fuse = fuseInstancesRef.current[category.name];
      if (!fuse) {
        filtered[category.name] = [];
        return;
      }

      const fuseResults = fuse.search(query);
      filtered[category.name] = fuseResults.map((r) => r.item);

      // Extract snippets for content matches
      fuseResults.forEach((r) => {
        const snippet = getMatchSnippet(r, query);
        if (snippet) {
          newSnippets[r.item.id] = snippet;
        }
      });
    });

    return { filteredResultsByCategory: filtered, snippets: newSnippets };
  }, [debouncedRawQuery, query, results]);

  return (
    <Dialog
      className="relative z-100"
      open={open}
      onClose={() => {
        setOpen(false);
        setRawQuery('');
        setDebouncedRawQuery('');
      }}
    >
      <DialogBackdrop
        transition
        className="bg-gray-500/25 fixed inset-0 transition-opacity data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-100 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto p-4 sm:p-6 md:p-20">
        <DialogPanel
          transition
          className="divide-gray-100 mx-auto max-w-xl transform divide-y overflow-hidden border-2 border-primary-700 bg-neutral-200 shadow-lg transition-all data-closed:scale-95 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        >
          <Combobox
            onChange={(item: any) => {
              if (item) {
                window.location = item.url;
              }
            }}
          >
            <div className="grid grid-cols-1">
              <ComboboxInput
                autoFocus
                className="text-gray-900 placeholder:text-gray-400 col-start-1 row-start-1 h-12 w-full bg-white pr-4 pl-11 outline-hidden sm:text-sm md:text-base"
                placeholder="Search..."
                onChange={(event) => {
                  setRawQuery(event.target.value);
                  updateDebouncedQuery(event.target.value);
                }}
                onBlur={() => {
                  setRawQuery('');
                  setDebouncedRawQuery('');
                }}
              />
              <MagnifyingGlassIcon
                className="text-gray-400 pointer-events-none col-start-1 row-start-1 ml-4 size-5 self-center"
                aria-hidden="true"
              />
            </div>

            {loading && query === '' && (
              <div className="space-y-4 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-16 animate-pulse rounded bg-primary-100" />
                    <div className="space-y-2">
                      {[1, 2].map((j) => (
                        <div
                          key={j}
                          className="flex items-center gap-3 px-4 py-2"
                        >
                          <div className="size-6 animate-pulse rounded bg-primary-100" />
                          <div className="bg-gray-100 h-4 flex-1 animate-pulse rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading &&
              Object.values(filteredResultsByCategory).some(
                (arr) => arr.length > 0
              ) && (
                <ComboboxOptions
                  static
                  as="ul"
                  className="max-h-80 transform-gpu scroll-py-10 scroll-pb-2 space-y-4 overflow-y-auto p-4 pb-2"
                >
                  {SEARCH_CATEGORIES.map((category) => {
                    const items =
                      filteredResultsByCategory[category.name] || [];
                    if (items.length === 0) return null;

                    const Icon = category.icon;

                    return (
                      <li key={category.name}>
                        <h2 className="text-gray-900 inline-flex gap-1 text-xs font-semibold tracking-wide uppercase">
                          <Icon /> {category.name}
                        </h2>
                        <ul className="text-gray-700 -mx-4 mt-2">
                          {items.map((item) => (
                            <ComboboxOption
                              as="li"
                              key={item.id}
                              value={item}
                              className="group flex cursor-pointer items-center px-4 py-2 transition-colors select-none data-focus:bg-primary-300 data-focus:outline-hidden"
                            >
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt=""
                                  className={
                                    category.name === 'People'
                                      ? 'size-6 flex-none border border-neutral-300 bg-neutral-100'
                                      : 'aspect-video h-6 flex-none border border-neutral-300 bg-neutral-100 object-cover'
                                  }
                                />
                              ) : (
                                <Icon
                                  class="text-gray-500 group-data-focus:text-gray-700 size-6 flex-none"
                                  aria-hidden="true"
                                />
                              )}
                              <div className="ml-3 min-w-0 flex-auto">
                                <span className="block truncate text-base">
                                  {item.name}
                                </span>
                                {snippets[item.id] && (
                                  <div className="text-gray-500 block truncate pt-1 text-sm">
                                    {snippets[item.id].before}
                                    <span className="text-gray-700 font-semibold">
                                      {snippets[item.id].match}
                                    </span>
                                    {snippets[item.id].after}
                                  </div>
                                )}
                              </div>
                              <div className="text-neutral-500">
                                {' '}
                                <ChevronRightIcon />
                              </div>
                            </ComboboxOption>
                          ))}
                        </ul>
                      </li>
                    );
                  })}
                </ComboboxOptions>
              )}

            {!loading && rawQuery === '?' && (
              <div className="px-6 py-14 text-center text-sm sm:px-14">
                <LifebuoyIcon
                  className="text-gray-400 mx-auto size-6"
                  aria-hidden="true"
                />
                <p className="text-gray-900 mt-4 font-semibold">
                  Help with searching
                </p>
                <p className="text-gray-600 mt-2">
                  Quickly search through site content and get results divided by
                  category. You can also use search modifiers in the footer to
                  search and show all results from a single category.
                </p>
              </div>
            )}

            {!loading &&
              query !== '' &&
              rawQuery !== '?' &&
              Object.values(filteredResultsByCategory).every(
                (arr) => arr.length === 0
              ) && (
                <div className="px-6 py-14 text-center text-sm sm:px-14">
                  <ExclamationTriangleIcon
                    className="text-gray-400 mx-auto size-6"
                    aria-hidden="true"
                  />
                  <p className="text-gray-900 mt-4 font-semibold">
                    No results found
                  </p>
                  <p className="text-gray-600 mt-2">
                    We couldn't find anything with that term. Please try again.
                  </p>
                </div>
              )}

            <div className="border-gray-100 bg-gray-50 text-gray-600 flex flex-wrap items-center border-t px-4 py-2.5 text-xs">
              Type{' '}
              {SEARCH_CATEGORIES.map((category) => (
                <span key={category.name} className="inline-flex items-center">
                  <kbd
                    className={classNames(
                      'mx-1 flex size-5 items-center justify-center border-b border-neutral-300 bg-neutral-50 font-semibold sm:mx-2',
                      rawQuery.startsWith(category.modifier)
                        ? 'border-primary-400 bg-primary-50 text-primary-700'
                        : 'border-gray-300 text-gray-700'
                    )}
                  >
                    {category.modifier}
                  </kbd>{' '}
                  <span className="">
                    {`for ${category.name.toLowerCase()}, `}
                  </span>
                </span>
              ))}
              <kbd
                className={classNames(
                  'mx-1 flex size-5 items-center justify-center border-b border-neutral-300 bg-neutral-50 font-semibold sm:mx-2',
                  rawQuery === '?'
                    ? 'border-primary-400 bg-primary-50 text-primary-700'
                    : 'border-gray-300 text-gray-700'
                )}
              >
                ?
              </kbd>{' '}
              for help.
            </div>
          </Combobox>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
