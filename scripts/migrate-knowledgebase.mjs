#!/usr/bin/env node
/**
 * One-shot migration of kb.measurementlab.net articles into the `kb` collection.
 *
 * Source: https://github.com/m-lab/knowledgebase — src/content/articles/*.md
 *
 * The knowledge base is organised by tag; the `kb` collection is organised as a book. This
 * script carries the mapping between the two: CHAPTERS below assigns every one
 * of the 31 source articles to exactly one chapter and a position within it,
 * derived from each article's primary tag. Articles with several tags (most of
 * them) keep only their most specific one as the chapter — the full tag list
 * survives in frontmatter.
 *
 * Everything else is mechanical:
 *   - `published: false`  → `status: draft`   (absent → `status: published`)
 *   - `../slug` body links → `/kb/slug`
 *   - `standalone`, `starter` and the source `order` are dropped; `order` here
 *     comes from CHAPTERS, and the other two have no meaning in a book layout.
 *
 * Usage: node scripts/migrate-knowledgebase.mjs <path-to-knowledgebase-repo> [--dry-run]
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { basename, join, resolve } from 'node:path';

// Chapter → ordered list of source article slugs. Position in the array is the
// page's `order`; position of the chapter is its `chapterOrder`.
const CHAPTERS = [
  {
    name: 'Getting Started',
    slugs: [
      'welcome-to-mlab',
      'getting-started-researchers',
      'getting-started-policymakers',
      'getting-started-advocates',
      'getting-started-isp-ixp',
    ],
  },
  {
    name: 'Understanding Measurement',
    slugs: [
      'understanding-speed-test-results',
      'internet-quality-beyond-speed',
      'test-rate-limits',
    ],
  },
  {
    name: 'Tests',
    slugs: [
      'test-ndt',
      'test-msak',
      'test-neubot-dash',
      'test-wehe',
      'test-reverse-traceroute',
      'integrating-mlab-tests',
      'troubleshooting-tests',
    ],
  },
  {
    name: 'Core Services',
    slugs: [
      'core-service-tcp-info',
      'core-service-packet-headers',
      'core-service-traceroute',
    ],
  },
  {
    name: 'Accessing Data',
    slugs: [
      'getting-started-bigquery',
      'accessing-data-buckets',
      'mlab-annotations-explained',
      'monthly-stats-dataset',
      'monthly-stats-percentiles',
      'monthly-stats-python',
    ],
  },
  {
    name: 'Research & Analysis',
    slugs: ['research-guide', 'tcpinfo-snapshot-analysis'],
  },
  {
    name: 'Running a Node',
    slugs: [
      'byos-overview',
      'ip-address-mismatch',
      'register-node-troubleshooting',
      'docker-byos-monitoring-logging',
      'checking-node-probability',
    ],
  },
];

const DEST = resolve('src/content/kb');

// --- tiny frontmatter reader ------------------------------------------------
// Deliberately not gray-matter: the source frontmatter is a flat, known set of
// scalar/inline-array fields, and this keeps the migration dependency-free.
function splitFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error('no frontmatter');
  const [, fm, body] = match;

  const data = {};
  for (const line of fm.split(/\r?\n/)) {
    const kv = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    const [, key, rawValue] = kv;
    let value = rawValue.trim();

    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((v) => v.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    } else if (value === 'true' || value === 'false') {
      value = value === 'true';
    } else {
      value = value.replace(/^["']|["']$/g, '');
    }
    data[key] = value;
  }
  return { data, body };
}

// YAML-quote only when the value could otherwise be misread.
function yamlString(value) {
  return /^[\w][\w \-.,/()'&]*$/.test(value) && !/:\s/.test(value)
    ? value
    : JSON.stringify(value);
}

// --- run --------------------------------------------------------------------
const sourceRepo = process.argv[2];
const dryRun = process.argv.includes('--dry-run');

if (!sourceRepo) {
  console.error(
    'usage: node scripts/migrate-knowledgebase.mjs <knowledgebase-repo> [--dry-run]'
  );
  process.exit(1);
}

const sourceDir = join(resolve(sourceRepo), 'src/content/articles');
if (!existsSync(sourceDir)) {
  console.error(`not found: ${sourceDir}`);
  process.exit(1);
}

const available = new Set(
  readdirSync(sourceDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => basename(f, '.md'))
);

const mapped = new Set(CHAPTERS.flatMap((c) => c.slugs));
const unmapped = [...available].filter((s) => !mapped.has(s));
const missing = [...mapped].filter((s) => !available.has(s));

if (unmapped.length) {
  console.error(
    `error: source articles with no chapter: ${unmapped.join(', ')}`
  );
  process.exit(1);
}
if (missing.length) {
  console.error(
    `error: chapter entries with no source article: ${missing.join(', ')}`
  );
  process.exit(1);
}

if (!dryRun) mkdirSync(DEST, { recursive: true });

const brokenLinks = [];
let drafts = 0;
let written = 0;

CHAPTERS.forEach((chapter, chapterIndex) => {
  chapter.slugs.forEach((slug, pageIndex) => {
    const raw = readFileSync(join(sourceDir, `${slug}.md`), 'utf8');
    const { data, body: sourceBody } = splitFrontmatter(raw);

    // `../other-article` → `/kb/other-article`
    const body = sourceBody.replace(
      /\]\(\.\.\/([a-z0-9-]+)([#?][^)]*)?\)/g,
      (_m, target, suffix = '') => {
        if (!available.has(target))
          brokenLinks.push({ from: slug, to: target });
        return `](/kb/${target}${suffix})`;
      }
    );

    const status = data.published === false ? 'draft' : 'published';
    if (status === 'draft') drafts++;

    const lines = [
      '---',
      `permalink: ${slug}`,
      `title: ${yamlString(data.title ?? slug)}`,
      `chapter: ${yamlString(chapter.name)}`,
      `chapterOrder: ${chapterIndex + 1}`,
      `order: ${pageIndex + 1}`,
      `status: ${status}`,
    ];
    if (data.description)
      lines.push(`description: ${yamlString(data.description)}`);
    if (Array.isArray(data.tags) && data.tags.length) {
      lines.push(`tags: [${data.tags.join(', ')}]`);
    }
    if (data.difficulty) lines.push(`difficulty: ${data.difficulty}`);
    lines.push('---', '');

    const out = `${lines.join('\n')}\n${body.replace(/^\n+/, '')}`;

    if (!dryRun) writeFileSync(join(DEST, `${slug}.md`), out, 'utf8');
    written++;
  });
});

console.log(
  `${dryRun ? '[dry run] ' : ''}${written} articles across ${CHAPTERS.length} chapters ` +
    `(${drafts} draft, ${written - drafts} published)`
);

if (brokenLinks.length) {
  console.log('\nlinks to articles that do not exist in the source repo:');
  for (const { from, to } of brokenLinks)
    console.log(`  ${from}.md → ../${to}`);
}
