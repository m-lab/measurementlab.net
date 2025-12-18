// @ts-check

import mdx from '@astrojs/mdx';
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';
import Icons from 'unplugin-icons/vite';
import { siteConfig } from './src/lib/config.ts';

// https://astro.build/config
export default defineConfig({
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
        name: 'IBM Plex Serif',
        weights: [300, 400, 500, 600, 700],
        cssVariable: '--font-ibm-plex-serif',
      },
    ],
  },

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

  integrations: [react(), sitemap(), mdx()],
  adapter: netlify(),
});
