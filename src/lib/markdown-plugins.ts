import type { Options as AutolinkHeadingsOptions } from 'rehype-autolink-headings';
import type { Options as ExternalLinksOptions } from 'rehype-external-links';

/**
 * Shared rehype configuration for the site's two markdown pipelines.
 *
 * The site renders markdown through two separate processors:
 *
 *   1. `astro.config.mjs` — Astro's own pipeline, for `.md` content
 *      (blog posts, tests). Configured via `markdown.processor: unified({...})`.
 *   2. `src/utils/renderMarkdown.ts` — a standalone unified pipeline, for
 *      markdown strings embedded in YAML/JSON content (richText sections,
 *      footer copy, publication descriptions, cookie banner).
 *
 * The `Options` types catch invalid hast properties at build time.
 */

/** Open external links in a new tab, without leaking the referrer. */
export const externalLinksOptions: ExternalLinksOptions = {
  target: '_blank',
  rel: ['noopener', 'noreferrer'],
};

/**
 * Append a `#` anchor to every heading.
 *
 * `ariaHidden` must be the *string* `'true'`: per ARIA, `aria-hidden=""` means
 * "not hidden", which would expose these decorative anchors to screen readers.
 */
export const autolinkHeadingsOptions: AutolinkHeadingsOptions = {
  behavior: 'append',
  headingProperties: { class: 'heading-anchor-group' },
  properties: {
    class: 'heading-anchor',
    ariaHidden: 'true',
    tabIndex: -1,
  },
  content: {
    type: 'element',
    tagName: 'span',
    properties: { class: 'heading-anchor-icon' },
    children: [{ type: 'text', value: '#' }],
  },
};
