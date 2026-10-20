// @ts-check

import fs from 'node:fs';
import path from 'node:path';
import { rehypeHeadingIds, unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';
import expressiveCode from 'astro-expressive-code';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';
import Icons from 'unplugin-icons/vite';
import redirectsData from './src/content/site/_redirects.json';
import { siteConfig } from './src/lib/config.ts';
import {
  autolinkHeadingsOptions,
  externalLinksOptions,
} from './src/lib/markdown-plugins.ts';
import { rehypeTableAlign } from './src/lib/rehype-table-align.ts';

// Sitemap <lastmod> for blog posts. Posts carry a single `publishedDate`
// (there is no updated date in the schema), so that is the last modification.
// Read straight from the markdown frontmatter because the content layer isn't
// available in the config; a missing or unparseable date means no <lastmod>.
const blogLastmod = (() => {
  const dir = path.resolve('src/content/blog');
  const byId = new Map();
  if (!fs.existsSync(dir)) return byId;
  for (const file of fs.readdirSync(dir, { recursive: true, encoding: 'utf8' })) {
    if (!file.endsWith('.md')) continue;
    const source = fs.readFileSync(path.join(dir, file), 'utf8');
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    const raw = frontmatter.match(/^publishedDate:\s*["']?([^"'\n]+?)["']?\s*$/m)?.[1];
    const date = raw ? new Date(raw) : undefined;
    if (date && !Number.isNaN(date.getTime())) {
      // Route ids are the file path without extension, lowercased by the glob loader
      byId.set(file.replace(/\.md$/, '').toLowerCase(), date);
    }
  }
  return byId;
})();

// Transform redirects array to Astro's format
// Internal paths get leading slash added, external URLs stay as-is
const redirects = redirectsData.redirects.reduce(
  (acc, { from, to, status }) => {
    const fromPath = `/${from}`;
    const toPath = to.startsWith('http') ? to : `/${to}`;
    acc[fromPath] = status
      ? {
          destination: toPath,
          status: /** @type {300 | 301 | 302 | 303 | 304 | 307 | 308} */ (
            status
          ),
        }
      : toPath;
    return acc;
  },
  /** @type {Record<string, string | { destination: string; status: 300 | 301 | 302 | 303 | 304 | 307 | 308 }>} */ ({})
);

// https://astro.build/config
export default defineConfig({
  redirects,
  site: siteConfig.url,
  compressHTML: true,
  devToolbar: {
    enabled: false,
  },
  image: {
    // Markdown `![]()` carries no width, so without a layout Astro has nothing to size
    // against and emits an empty `srcset` so inline post images were being requested at
    // their intrinsic width (up to 4032px) into a ~700px prose column.
    //
    // `responsiveStyles` is deliberately left at its default of `false`. It would inject
    // Astro's own `:where()` rules, and because Tailwind 4 puts its utilities in cascade
    // layers, Astro's sizing would override Tailwind classes
    layout: 'constrained',
  },
  fonts: [
    {
      provider: fontProviders.bunny(),
      name: 'Inter',
      weights: [400, 500, 600, 700, 800],
      styles: ['normal'],
      cssVariable: '--font-inter',
    },
    {
      provider: fontProviders.bunny(),
      name: 'Inter',
      weights: [400],
      styles: ['italic'],
      cssVariable: '--font-inter',
    },
    {
      provider: fontProviders.bunny(),
      name: 'IBM Plex Mono',
      weights: [400],
      styles: ['normal'],
      fallbacks: ['monospace'],
      cssVariable: '--font-ibm-plex-mono',
    },
  ],
  // markdown: {
  //   shikiConfig: {
  //     // Choose from Shiki's built-in themes (or add your own)
  //     // https://shiki.style/themes
  //     theme: 'catppuccin-frappe',
  //   },
  // },
  vite: {
    plugins: [
      tailwindcss(),
      Icons({
        compiler: 'jsx',
        jsx: 'react',
        customCollections: {
          'm-lab': FileSystemIconLoader('./src/assets/mlab-icons'),
        },
      }),
    ],
  },
  markdown: {
    // Astro 7 defaults to the Sätteri processor, which does not run remark/rehype
    // plugins. Keep the unified pipeline so the four rehype plugins below (one of
    // them repo-local) continue to apply.
    processor: unified({
      // Shared options live in src/lib/markdown-plugins.ts, alongside the
      // standalone pipeline in src/utils/renderMarkdown.ts that mirrors them.
      rehypePlugins: [
        rehypeHeadingIds,
        [rehypeExternalLinks, externalLinksOptions],
        rehypeTableAlign,
        [rehypeAutolinkHeadings, autolinkHeadingsOptions],
      ],
    }),
  },
  integrations: [
    react(),
    sitemap({
      // Endpoints (JSON API, feeds, text files) are not pages
      filter: (page) => {
        const { pathname } = new URL(page);
        return (
          !/^\/api\//.test(pathname) &&
          !/\.(json|png|xml|txt)$/.test(pathname)
        );
      },
      serialize(item) {
        const { pathname } = new URL(item.url);
        const match = pathname.match(/^\/blog\/(.+?)\/?$/);
        const lastmod = match
          ? blogLastmod.get(decodeURIComponent(match[1]).toLowerCase())
          : undefined;
        if (lastmod) item.lastmod = lastmod.toISOString();
        return item;
      },
    }),
    // TODO: #1 make sure our mono font works with expressiveCode
    expressiveCode({
      themes: ['catppuccin-frappe'],
      defaultProps: {
        // Enable word wrap by default
        wrap: true,
        // Disable wrapped line indentation for terminal languages
        overridesByLang: {
          'bash,ps,sh': { preserveIndent: false },
        },
      },
    }),
    mdx(),
  ],
  adapter: netlify(),
});
