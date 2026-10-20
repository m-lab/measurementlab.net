import { getCollection, getEntry } from 'astro:content';
import { siteConfig } from '@lib/config';
import { getBlogPosts } from '@utils/blog';
import { isVisible } from '@utils/content';
import { getKbChapters, getKbUrl } from '@utils/kb';
import { getPagePath, getPages } from '@utils/pages';
import { getPublications } from '@utils/publications';
import { toPlainText } from '@utils/seo';
import { getTests } from '@utils/tests';
import type { APIRoute } from 'astro';

/** Newest posts listed; older ones remain reachable via the sitemap. */
const RECENT_POSTS = 50;
/** Per-entry summary cap, so the whole file stays small. */
const SUMMARY_LENGTH = 200;

const SOCIAL_LABELS: Record<string, string> = {
  bluesky: 'Bluesky',
  github: 'GitHub',
  mastodon: 'Mastodon',
  linkedin: 'LinkedIn',
  x: 'X',
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
};

const oneLine = (text = '') => toPlainText(text).replace(/\s+/g, ' ').trim();

const truncate = (text: string, max: number) =>
  text.length <= max
    ? text
    : `${text
        .slice(0, max)
        .replace(/\s+\S*$/, '')
        .replace(/[\s,.;:]+$/, '')}…`;

/**
 * /llms.txt (https://llmstxt.org) — a plain-text map of the site for AI
 * crawlers and assistants, generated from the content collections so it
 * never drifts from the pages. Drafts follow the usual visibility rules.
 */
export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL(siteConfig.url);
  const abs = (path: string) => new URL(path, base).href;

  const entry = (title: string, path: string, summary?: string) => {
    const text = summary ? truncate(oneLine(summary), SUMMARY_LENGTH) : '';
    return `- [${title}](${abs(path)})${text ? `: ${text}` : ''}`;
  };

  const section = (heading: string, lines: string[]) =>
    lines.length ? `## ${heading}\n\n${lines.join('\n')}\n` : '';

  const [config, pages, posts, chapters, tests, datasets, people, publications] =
    await Promise.all([
      getEntry('site', 'config'),
      getPages(),
      getBlogPosts(),
      getKbChapters(),
      getTests(),
      getCollection('data'),
      getCollection('people'),
      getPublications(),
    ]);
  if (!config) throw new Error('Site configuration not found');

  const pageLines = pages
    .map((page) => ({ page, path: getPagePath(page) }))
    .sort((a, b) => a.path.localeCompare(b.path))
    .map(({ page, path }) => entry(page.data.title, `/${path}`, page.data.description));

  const postLines = posts
    .slice(0, RECENT_POSTS)
    .map((post) => entry(post.data.title, `/blog/${post.id}`, post.data.excerpt));

  // Knowledge base articles are grouped by chapter, in reading order
  const kbLines = chapters.flatMap((chapter) => [
    `### ${chapter.name}`,
    '',
    ...chapter.pages.map((article) =>
      entry(article.data.title, getKbUrl(article), article.data.description)
    ),
    '',
  ]);

  const testLines = tests.map((test) =>
    entry(test.data.title, test.data.permalink, test.data.description)
  );

  const datasetLines = datasets
    .filter((ds) => isVisible(ds))
    .map((ds) => entry(ds.data.title, `/data/${ds.id}`, ds.data.description));

  const peopleLines = people
    .filter((person) => isVisible(person))
    .map((person) =>
      entry(
        person.data.name,
        `/people/${person.data.id}`,
        [person.data.title, person.data.affiliation].filter(Boolean).join(', ')
      )
    );

  const publicationLines = publications.map((pub) =>
    entry(
      `${pub.data.title} (${pub.data.year})`,
      `/publications/${pub.id}`,
      pub.data.description ?? pub.data.authors
    )
  );

  const linkLines = [
    ...Object.entries(config.data.social ?? {})
      .filter(([, href]) => !!href)
      .map(([platform, href]) => `- ${SOCIAL_LABELS[platform] ?? platform}: ${href}`),
    `- RSS feed: ${abs('/rss.xml')}`,
    `- Sitemap: ${abs('/sitemap-index.xml')}`,
  ];

  const body = [
    `# ${config.data.title}`,
    '',
    `> ${oneLine(config.data.description)}`,
    '',
    section('Pages', pageLines),
    section('Tests and services', testLines),
    section('Data', datasetLines),
    kbLines.length ? `## Knowledge Base\n\n${kbLines.join('\n')}` : '',
    section('Blog', postLines),
    section('Publications', publicationLines),
    section('People', peopleLines),
    section('Links', linkLines),
  ]
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd();

  return new Response(`${body}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
