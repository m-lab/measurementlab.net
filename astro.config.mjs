// @ts-check

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
    sitemap(),
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
