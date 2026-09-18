/**
 * Monthly Stats manifest: loading and indexing, at build time.
 *
 * The manifest maps a cache path to a public download URL:
 *
 *   "cache/v1/20241001T000000Z/20241101T000000Z/downloads_by_country_asn/data.parquet":
 *     { "sha256": "…", "url": "https://storage.googleapis.com/…" }
 *
 * STATS_MANIFEST_URL is treated as an endpoint whether it is local or remote. A
 * site-relative path is read from `public/`, which is where the file is served from.
 * An http(s) URL is fetched. Moving the manifest to a remote host means changing this
 * one constant. The page is static, so a manifest update needs a rebuild to show up.
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// TODO(bassosimone): replace vendoring when there is automation
export const STATS_MANIFEST_URL = '/data/manifest.json';

export interface ManifestFile {
  sha256: string;
  url: string;
}

export interface StatsManifest {
  v: number;
  files: Record<string, ManifestFile>;
}

/** Shown first. The KB introduces the slices starting from this one. */
export const DEFAULT_SLICE = 'country';

export type Direction = 'downloads' | 'uploads';
export const DIRECTIONS: Direction[] = ['downloads', 'uploads'];

export interface StatsFiles {
  parquet?: ManifestFile;
  stats?: ManifestFile;
}

export interface StatsMonth {
  /** `YYYY-MM` of the period start; sorts chronologically as a string. */
  month: string;
  year: string;
  /** Exact UTC period bounds, `YYYY-MM-DD`. The end is exclusive. */
  start: string;
  end: string;
  /** Keyed `${direction}/${slice}`. */
  files: Record<string, StatsFiles>;
}

export interface StatsIndex {
  months: StatsMonth[];
  /** Slice ids, in the KB's order, e.g. `country`, `country_city_asn`. */
  slices: string[];
}

// Labels follow the KB's naming (/kb/monthly-stats-dataset). An unknown slice still
// renders, with a label derived from its id; it just sorts last.
const SLICE_LABELS: Record<string, string> = {
  country: 'Country',
  country_asn: 'Country + ASN',
  country_subdivision1: 'Country + state/province',
  country_subdivision1_asn: 'Country + state/province + ASN',
  country_city: 'Country + city',
  country_city_asn: 'Country + city + ASN',
};
const SLICE_ORDER = Object.keys(SLICE_LABELS);

export const sliceLabel = (slice: string) =>
  SLICE_LABELS[slice] ??
  slice
    .split('_')
    .map((part) => (part === 'asn' ? 'ASN' : part))
    .join(' + ')
    .replace(/^./, (c) => c.toUpperCase());

const KEY_PATTERN =
  /^cache\/v\d+\/(\d{4})(\d{2})(\d{2})T\d{6}Z\/(\d{4})(\d{2})(\d{2})T\d{6}Z\/(downloads|uploads)_by_([a-z0-9_]+)\/(data\.parquet|stats\.json)$/;

const isManifestFile = (value: unknown): value is ManifestFile =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as ManifestFile).url === 'string' &&
  typeof (value as ManifestFile).sha256 === 'string';

export async function loadStatsManifest(
  url = STATS_MANIFEST_URL
): Promise<StatsManifest> {
  let text: string;
  if (/^https?:\/\//.test(url)) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Stats manifest: ${url} returned HTTP ${response.status}`
      );
    }
    text = await response.text();
  } else {
    // Relative to the project root: import.meta.url points into the bundle at build time.
    text = await readFile(join(process.cwd(), 'public', url), 'utf8');
  }
  const data = JSON.parse(text) as StatsManifest | null;
  if (typeof data?.files !== 'object' || data.files === null) {
    throw new Error(`Stats manifest: ${url} has no "files" object`);
  }
  return data;
}

// Fails the build rather than quietly dropping files: an unrecognised key means the
// manifest layout changed, and the page would otherwise go on listing an incomplete set.
export function indexStatsManifest(manifest: StatsManifest): StatsIndex {
  const months = new Map<string, StatsMonth>();
  const slices = new Set<string>();
  const unrecognised: string[] = [];

  for (const [key, file] of Object.entries(manifest.files)) {
    const match = KEY_PATTERN.exec(key);
    if (!match || !isManifestFile(file)) {
      unrecognised.push(key);
      continue;
    }
    const [, sy, sm, sd, ey, em, ed, direction, slice, filename] = match;
    const month = `${sy}-${sm}`;

    let entry = months.get(month);
    if (!entry) {
      entry = {
        month,
        year: sy,
        start: `${sy}-${sm}-${sd}`,
        end: `${ey}-${em}-${ed}`,
        files: {},
      };
      months.set(month, entry);
    }
    slices.add(slice);

    const cellKey = `${direction}/${slice}`;
    entry.files[cellKey] ??= {};
    entry.files[cellKey][filename === 'data.parquet' ? 'parquet' : 'stats'] =
      file;
  }

  if (unrecognised.length > 0) {
    throw new Error(
      `Stats manifest: ${unrecognised.length} entr${unrecognised.length === 1 ? 'y does' : 'ies do'} ` +
        `not match cache/v<n>/<start>/<end>/<direction>_by_<slice>/<file>, ` +
        `e.g. "${unrecognised[0]}". Update KEY_PATTERN in src/utils/statsManifest.ts.`
    );
  }
  if (months.size === 0) {
    throw new Error('Stats manifest: no files listed');
  }

  const rank = (slice: string) => {
    const i = SLICE_ORDER.indexOf(slice);
    return i === -1 ? SLICE_ORDER.length : i;
  };

  return {
    months: [...months.values()].sort((a, b) => a.month.localeCompare(b.month)),
    slices: [...slices].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b)),
  };
}
