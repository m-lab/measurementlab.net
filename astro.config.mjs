// @ts-check

import mdx from '@astrojs/mdx';
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';
import expressiveCode from 'astro-expressive-code';
import rehypeExternalLinks from 'rehype-external-links';
import { rehypeTableAlign } from './src/lib/rehype-table-align.ts';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';
import Icons from 'unplugin-icons/vite';
import redirectsData from './src/content/site/_redirects.json';
import { siteConfig } from './src/lib/config.ts';

// Transform redirects array to Astro's format
// Internal paths get leading slash added, external URLs stay as-is
const redirects = redirectsData.redirects.reduce(
  (acc, { from, to, status }) => {
    const fromPath = `/${from}`;
    const toPath = to.startsWith('http') ? to : `/${to}`;
    acc[fromPath] = status
      ? { destination: toPath, status: /** @type {300 | 301 | 302 | 303 | 304 | 307 | 308} */ (status) }
      : toPath;
    return acc;
  },
  /** @type {Record<string, string | { destination: string; status: 300 | 301 | 302 | 303 | 304 | 307 | 308 }>} */ ({})
);

// https://astro.build/config
export default defineConfig({
  redirects,
  site: siteConfig.url,
  devToolbar: {
    enabled: false,
  },
  experimental: {
    fonts: [
      {
        provider: fontProviders.bunny(),
        name: 'Inter',
        weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        cssVariable: '--font-inter',
      },
      {
        provider: fontProviders.bunny(),
        name: 'IBM Plex Mono',
        weights: [400],
        cssVariable: '--font-ibm-plex-mono',
      },
    ],
  },
  // markdown: {
  //   shikiConfig: {
  //     // Choose from Shiki's built-in themes (or add your own)
  //     // https://shiki.style/themes
  //     theme: 'catppuccin-frappe',
  //   },
  // },
  vite: {
    // TODO #1 - remove expect error when Astro updates to Vite 7
    // https://github.com/withastro/astro/issues/14030#issuecomment-3027129338
    plugins: [
      // @ts-expect-error
      tailwindcss(),
      // @ts-expect-error
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
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          // content: { type: 'text', value: ' 🔗' },
          target: '_blank',
          rel: ['noopener', 'noreferrer'],
        },
      ],
      rehypeTableAlign,
    ],
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
