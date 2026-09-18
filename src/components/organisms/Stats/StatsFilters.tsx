import FilterDropdown from '@components/organisms/Filter/FilterDropdown';
import { useEffect, useState } from 'react';
import CheckIcon from '~icons/heroicons/check-20-solid';
import ClipboardDocumentIcon from '~icons/heroicons/clipboard-document-20-solid';

/**
 * Filter bar for /data/stats. The tables are rendered at build time by
 * StatsLanding.astro, and this island shows, hides and reorders them in place.
 */

const SORT_OPTIONS = ['newest', 'oldest'] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

interface StatsFiltersProps {
  slices: { id: string; label: string }[];
  years: string[];
  defaultSlice: string;
  manifestUrl: string;
}

interface Summary {
  months: number;
  first?: string;
  last?: string;
  parquetUrls: string[];
}

// Reverses the year groups and the month rows inside them. The year heading is each
// tbody's first row and stays in place.
function applyOrder(table: HTMLTableElement, order: SortOption) {
  if (table.dataset.order === order) return;
  for (const body of [...table.tBodies].reverse()) {
    for (const row of [...body.rows].slice(1).reverse()) body.append(row);
    table.append(body);
  }
  table.dataset.order = order;
}

// The selection lives in the query string so a filtered view can be linked to.
function readQuery({
  slices,
  years: yearOptions,
  defaultSlice,
}: StatsFiltersProps) {
  const params = new URLSearchParams(window.location.search);
  const slice = params.get('slice');
  const years = new Set(yearOptions);
  return {
    slice: slice && slices.some((s) => s.id === slice) ? slice : defaultSlice,
    years: (params.get('year')?.split(',') ?? []).filter((y) => years.has(y)),
    sort: (params.get('sort') === 'oldest' ? 'oldest' : 'newest') as SortOption,
  };
}

function writeQuery(
  slice: string,
  years: string[],
  sort: SortOption,
  defaultSlice: string
) {
  const params = new URLSearchParams(window.location.search);
  const set = (key: string, value: string | null) =>
    value ? params.set(key, value) : params.delete(key);
  set('slice', slice === defaultSlice ? null : slice);
  set('year', years.length ? [...years].sort().join(',') : null);
  set('sort', sort === 'newest' ? null : sort);
  const query = params.toString();
  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
  );
}

export default function StatsFilters(props: StatsFiltersProps) {
  const { slices, years: yearOptions, defaultSlice, manifestUrl } = props;

  const [slice, setSlice] = useState(defaultSlice);
  const [years, setYears] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [ready, setReady] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [copied, setCopied] = useState<'idle' | 'done' | 'failed'>('idle');

  // Restore a linked selection once, on the client.
  useEffect(() => {
    const query = readQuery({
      slices,
      years: yearOptions,
      defaultSlice,
      manifestUrl,
    });
    setSlice(query.slice);
    setYears(query.years);
    setSortBy(query.sort);
    setReady(true);
  }, [slices, yearOptions, defaultSlice, manifestUrl]);

  useEffect(() => {
    if (!ready) return;
    const selected = new Set(years);
    let visible: HTMLTableElement | undefined;

    for (const table of document.querySelectorAll<HTMLTableElement>(
      'table[data-stats-slice]'
    )) {
      const active = table.dataset.statsSlice === slice;
      table.hidden = !active;
      if (!active) continue;
      visible = table;
      applyOrder(table, sortBy);
      for (const body of table.tBodies) {
        body.hidden =
          selected.size > 0 && !selected.has(body.dataset.year ?? '');
      }
    }

    const rows = visible
      ? [
          ...visible.querySelectorAll<HTMLElement>(
            'tbody:not([hidden]) tr[data-month]'
          ),
        ]
      : [];
    const monthsShown = rows.map((r) => r.dataset.month ?? '').sort();
    setSummary({
      months: rows.length,
      first: monthsShown[0],
      last: monthsShown.at(-1),
      parquetUrls: rows.flatMap((r) =>
        [...r.querySelectorAll<HTMLAnchorElement>('a[data-parquet]')].map(
          (a) => a.href
        )
      ),
    });
    writeQuery(slice, years, sortBy, defaultSlice);
  }, [ready, slice, years, sortBy, defaultSlice]);

  const copyUrls = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(
        `${summary.parquetUrls.join('\n')}\n`
      );
      setCopied('done');
    } catch {
      setCopied('failed');
    }
    window.setTimeout(() => setCopied('idle'), 2500);
  };

  const sliceLabel = slices.find((s) => s.id === slice)?.label ?? slice;

  return (
    <div className="mb-6">
      <div className="relative z-20 bg-neutral-900 px-6 py-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-stretch gap-4 md:flex-row md:items-center md:gap-8">
          <div className="flex flex-1 items-center gap-4 md:flex-3">
            <span className="text-lg font-bold text-neutral-50 uppercase">
              Granularity:
            </span>
            <div className="min-w-0 flex-1">
              <FilterDropdown
                label="granularity"
                options={slices.map((s) => s.label)}
                value={sliceLabel}
                onChange={(label) => {
                  const next = slices.find((s) => s.label === label);
                  if (next) setSlice(next.id);
                }}
                showAllOption={false}
              />
            </div>
          </div>
          <div className="flex-1 md:flex-2">
            <FilterDropdown
              label="year"
              options={yearOptions}
              value={years}
              onChange={(value) => setYears(value as string[])}
              multiple={true}
            />
          </div>
          <div className="flex flex-1 items-center gap-4 md:flex-2">
            <span className="text-lg font-bold text-neutral-50 uppercase">
              Sort:
            </span>
            <FilterDropdown
              label="sort"
              options={[...SORT_OPTIONS]}
              value={sortBy}
              onChange={(value) => setSortBy(value as SortOption)}
              showAllOption={false}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 pt-12 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:px-8">
        <p className="text-muted" aria-live="polite">
          {summary &&
            (summary.months > 0 ? (
              <>
                <strong className="font-semibold text-neutral-900">
                  {summary.months} months
                </strong>{' '}
                by {sliceLabel},{' '}
                {summary.first === summary.last
                  ? summary.first
                  : `${summary.first} to ${summary.last}`}
              </>
            ) : (
              'No files match this selection.'
            ))}
        </p>
        <div className="flex shrink-0 items-center gap-4">
          <button
            type="button"
            onClick={copyUrls}
            disabled={!summary?.parquetUrls.length}
            className="inline-flex cursor-pointer items-center gap-1.5 font-medium text-primary-700 hover:text-primary-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied === 'done' ? (
              <CheckIcon className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ClipboardDocumentIcon className="h-4 w-4" aria-hidden="true" />
            )}
            {copied === 'done'
              ? `Copied ${summary?.parquetUrls.length} URLs`
              : copied === 'failed'
                ? 'Copy failed'
                : `Copy ${summary?.parquetUrls.length ?? 0} Parquet URLs`}
          </button>
          <a href={manifestUrl}>manifest.json</a>
        </div>
      </div>
    </div>
  );
}
