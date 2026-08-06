/**
 * schema.org JSON-LD builders for the datasets collection.
 *
 * The catalog page and each dataset detail page describe the same entities, so
 * they share these builders. The Dataset node emitted inside the catalog's `dataset`
 * array is identical to the one on the corresponding detail page, and both carry
 * the same `@id`.
 *
 * Note every URL here is derived from `siteConfig.url`. Until that points at the
 * production domain, the emitted graph describes the staging site — which is why
 * `JsonLd.astro` only renders in production builds.
 */

import type { CollectionEntry } from 'astro:content';
import { siteConfig } from '@lib/config';

type DatasetEntry = CollectionEntry<'datasets'>;

export const LICENSE_URL = 'https://creativecommons.org/publicdomain/zero/1.0/';

export const DC_SUBJECT = [
  'Internet measurement',
  'Network performance',
  'Broadband',
  'Open data',
];

export const MLAB_CREATOR = {
  '@type': 'Organization' as const,
  name: 'Measurement Lab',
  url: siteConfig.url,
  sameAs: [
    'https://www.wikidata.org/wiki/Q64928862',
    'https://github.com/m-lab',
  ],
};

export const keywordsFor = (ds: DatasetEntry['data']): string[] => [
  ...new Set([...DC_SUBJECT, ...(ds.keywords ?? [])]),
];

export const CATALOG_URL = `${siteConfig.url}/datasets/`;

export const datasetUrl = (id: string) => `${siteConfig.url}/datasets/${id}/`;

/** ISO 8601 interval, with an open end for ongoing collection. */
export const temporalCoverageOf = (
  ds: DatasetEntry['data']
): string | undefined => {
  const { temporalCoverageStart: start, temporalCoverageEnd: end } = ds;
  if (!start) return undefined;
  return `${start}/${end === 'present' || !end ? '..' : end}`;
};

/** gs:// is not dereferenceable by a crawler; point at the browser console instead. */
const contentUrlOf = (url: string) =>
  url.startsWith('gs://')
    ? `https://console.cloud.google.com/storage/browser/${url.replace('gs://', '')}`
    : url;

/**
 * A complete schema.org Dataset node.
 *
 * @param standalone - adds `@context`, for when this is the root node of its own
 *   <script> block. Nested nodes inherit the catalog's context and must omit it.
 */
export const buildDatasetNode = (
  ds: DatasetEntry,
  { standalone = false }: { standalone?: boolean } = {}
) => {
  const {
    title,
    description,
    spatialCoverage,
    accessPoints,
    documentationLinks,
    testRef,
  } = ds.data;

  const url = datasetUrl(ds.id);
  const temporalCoverage = temporalCoverageOf(ds.data);

  const distribution = (accessPoints ?? []).map((ap) => ({
    '@type': 'DataDownload',
    name: ap.label,
    ...(ap.description ? { description: ap.description } : {}),
    ...(ap.format ? { encodingFormat: ap.format } : {}),
    contentUrl: contentUrlOf(ap.url),
  }));

  return {
    ...(standalone ? { '@context': 'https://schema.org/' } : {}),
    '@type': 'Dataset',
    '@id': url,
    name: title,
    description,
    url,
    identifier: url,
    creator: MLAB_CREATOR,
    publisher: MLAB_CREATOR,
    maintainer: MLAB_CREATOR,
    inLanguage: 'en',
    license: LICENSE_URL,
    isAccessibleForFree: true,
    keywords: keywordsFor(ds.data),
    includedInDataCatalog: {
      '@type': 'DataCatalog',
      '@id': CATALOG_URL,
      url: CATALOG_URL,
    },
    ...(spatialCoverage
      ? { spatialCoverage: { '@type': 'Place', name: spatialCoverage } }
      : {}),
    ...(temporalCoverage ? { temporalCoverage } : {}),
    ...(distribution.length > 0 ? { distribution } : {}),
    ...(testRef ? { isBasedOn: `${siteConfig.url}/tests/${testRef}/` } : {}),
    ...(documentationLinks?.length
      ? {
          subjectOf: documentationLinks.map((d) => ({
            '@type': 'WebPage',
            name: d.label,
            url: d.url,
          })),
        }
      : {}),
  };
};

/** The DataCatalog node, embedding a full Dataset node per member. */
export const buildCatalogJsonLd = (datasets: DatasetEntry[]) => ({
  '@context': 'https://schema.org/',
  '@type': 'DataCatalog',
  '@id': CATALOG_URL,
  name: 'Measurement Lab Open Data Catalog',
  description:
    'Open Internet measurement datasets collected by Measurement Lab, released under CC0 1.0 Universal.',
  url: CATALOG_URL,
  identifier: CATALOG_URL,
  creator: MLAB_CREATOR,
  publisher: MLAB_CREATOR,
  maintainer: MLAB_CREATOR,
  inLanguage: 'en',
  license: LICENSE_URL,
  isAccessibleForFree: true,
  keywords: DC_SUBJECT,
  dataset: datasets.map((ds) => buildDatasetNode(ds)),
});
