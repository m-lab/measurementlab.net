import { defineCollection, type ImageFunction } from 'astro:content';
import { sectionBackgroundNames, zigzagNames } from '@utils/backgrounds';
import type { ImageMetadata } from 'astro';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import blogCategories from './content/categories/blog.json';
import datasetCategories from './content/categories/datasets.json';
import partnerCategories from './content/categories/partners.json';
import peopleCategories from './content/categories/people.json';
import publicationsCategories from './content/categories/publications.json';

// Shared status field for content visibility across all collections
const statusSchema = z
  .enum(['draft', 'published', 'archived'])
  .default('draft');

// Shared color palette enum matching the site's design tokens
const colorPaletteSchema = z.enum([
  'primary',
  'secondary',
  'supporting1',
  'supporting2',
  'neutral',
  'speed',
]);

export type ColorPaletteType = z.infer<typeof colorPaletteSchema>;

// Atoms (no image dependency, can be shared)
const buttonSchema = z.object({
  variant: z.string(),
  size: z.string(),
  href: z.string(),
  text: z.string(),
});

const cardBaseSchema = z.object({
  title: z.string(),
  content: z.string().optional(),
  button: buttonSchema.optional(),
  color: colorPaletteSchema.optional(),
  icon: z
    .enum(['measurement', 'insights', 'community', 'mlab-blue', 'mlab-white'])
    .optional(),
});

export type ButtonType = z.infer<typeof buttonSchema>;
export type CardType = z.infer<typeof cardBaseSchema> & {
  image?: ImageMetadata;
};

// Helper to create schemas with image support
const createSchemas = (image: ImageFunction) => {
  // Card (extends base with image)
  const cardSchema = cardBaseSchema.extend({
    image: image().optional(),
  });

  //  Person
  const personSchema = z.object({
    id: z.string(),
    name: z.string(),
    headshot: image(),
    title: z.string().optional(),
    affiliation: z.string().optional(),
    extraInfo: z.string().optional(),
    url: z.string().optional(),
    sections: z.array(
      z.enum(peopleCategories.categories as [string, ...string[]])
    ),
    status: statusSchema,
  });

  //  Partner
  const partnerSchema = z.object({
    name: z.string(),
    affiliation: z.string().optional(),
    url: z.string().optional(),
    category: z.enum(partnerCategories.categories as [string, ...string[]]),
    image: image().optional(),
  });

  const SectionCommonSchema = z.object({
    background: z
      .object({
        // Sourced from src/utils/backgrounds.ts, the same map SectionLayout and
        // RichTextSection use to pick background, text colour and prose inversion.
        color: z.enum(sectionBackgroundNames).default('white'),
        image: image().optional(),
      })
      .optional(),
  });

  // Sections defined as a union type so they can be used as variable components
  const sectionsSchema = z.discriminatedUnion('type', [
    SectionCommonSchema.extend({
      type: z.literal('hero'),
      title: z.string(),
      subtitle: z.string().optional(),
      zigzag: z
        .enum(zigzagNames)
        .optional(),
    }),
    SectionCommonSchema.extend({
      type: z.literal('richText'),
      withTOC: z.boolean().optional().default(false),
      content: z.string(),
    }),
    SectionCommonSchema.extend({
      type: z.literal('button'),
      title: z.string().optional(),
      buttons: z.array(buttonSchema).optional(),
    }),
    SectionCommonSchema.extend({
      type: z.literal('card'),
      title: z.string(),
      description: z.string().optional(),
      cards: z.array(cardSchema).optional(),
      buttons: z.array(buttonSchema).optional(),
    }),
    SectionCommonSchema.extend({
      type: z.literal('people'),
      // Sourced from src/content/categories/people.json, the same list that
      // feeds the CMS dropdown. Keeps a typo from silently rendering an empty
      // section instead of failing the build.
      category: z
        .enum(peopleCategories.categories as [string, ...string[]])
        .optional(),
    }),
    SectionCommonSchema.extend({
      type: z.literal('partners'),
      title: z.string(),
      category: z
        .enum(partnerCategories.categories as [string, ...string[]])
        .optional(),
    }),
    // homepage-specific section types
    SectionCommonSchema.extend({
      type: z.literal('speed_test'),
      title: z.string(),
      description: z.string().optional(),
    }),
    SectionCommonSchema.extend({
      type: z.literal('featured_partners'),
      title: z.string(),
      description: z.string().optional(),
    }),
    SectionCommonSchema.extend({
      type: z.literal('blog_roll'),
      title: z.string().default('Latest News'),
      description: z.string().optional(),
      limit: z.number().min(1).max(12).default(3),
      showMore: z.boolean().default(false),
    }),
    // Hand-picked counterpart to blog_roll — same layout, editor chooses the posts
    SectionCommonSchema.extend({
      type: z.literal('related_posts'),
      title: z.string().default('Related Posts'),
      description: z.string().optional(),
      posts: z.array(z.string()).max(3).default([]), // Blog post permalinks (max 3)
    }),
    // Hand-picked tests, rendered with the same card as the /tests listing
    SectionCommonSchema.extend({
      type: z.literal('tests'),
      title: z.string().default('Tests'),
      description: z.string().optional(),
      tests: z.array(z.string()).default([]), // Test permalinks (e.g. "/tests/ndt/")
    }),
    // status map section for /status page
    SectionCommonSchema.extend({
      type: z.literal('infrastructureMap'),
      title: z.string().default('Infrastructure Map'),
      description: z.string().optional(),
    }),
  ]);

  const flexiSectionSchema = SectionCommonSchema.extend({
    type: z.literal('flexi'),
    title: z.string(),
    description: z.string().optional(),
    sections: z.array(sectionsSchema).optional(),
  });

  const combinedSectionsSchema = z
    .union([...sectionsSchema.options, flexiSectionSchema])
    .array()
    .optional();

  return {
    buttonSchema,
    cardSchema,
    personSchema,
    partnerSchema,
    sectionsSchema: combinedSectionsSchema,
  };
};

const pagesCollection = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/pages' }),
  schema: ({ image }) => {
    const { sectionsSchema } = createSchemas(image);

    return z.object({
      title: z.string(),
      description: z.string().optional(),
      heroImage: image().optional(),
      permalink: z.string(),
      status: statusSchema,
      zigzag: z
        .enum(zigzagNames)
        .optional(),
      sections: sectionsSchema.optional(),
    });
  },
});

const peopleCollection = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/people' }),
  schema: ({ image }) => createSchemas(image).personSchema,
});

const partnersCollection = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/partners' }),
  schema: ({ image }) => {
    const { partnerSchema } = createSchemas(image);
    return partnerSchema.extend({
      id: z.string(),
      order: z.number().optional().default(999),
      status: statusSchema,
    });
  },
});

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      permalink: z.string(),
      title: z.string(),
      excerpt: z.string().optional(),
      authors: z.array(z.string()).optional(), // References to people collection IDs
      externalAuthors: z.string().optional(), // Comma-separated external author names
      status: statusSchema,
      categories: z.array(
        z.enum(blogCategories.categories as [string, ...string[]])
      ),
      publishedDate: z.date(),
      heroImage: image().optional(),
      relatedPosts: z.array(z.string()).max(3).optional(), // Array of blog post permalinks (max 3)
    }),
});

const siteCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.json', base: './src/content/site' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      url: z.url(),
      favicon: z.string().default('/favicon.svg'),
      defaultOgImage: image().optional(),
      defaultLogoLight: image().optional(),
      defaultLogoDark: image().optional(),
      social: z
        .object({
          bluesky: z.string().optional(),
          github: z.string().optional(),
          mastodon: z.string().optional(),
          linkedin: z.string().optional(),
          x: z.string().optional(),
          facebook: z.string().optional(),
          instagram: z.string().optional(),
          youtube: z.string().optional(),
        })
        .optional(),
      footer: z.object({
        description: z.string().optional(),
        bottom: z.string(),
      }),
      archivedBanner: z
        .object({
          message: z.string(),
          color: colorPaletteSchema,
        })
        .optional(),
      cookieConsent: z
        .object({
          message: z.string(),
          googleAnalyticsId: z.string().optional(),
        })
        .optional(),
    }),
});

// Flexible link schema - can be internal page ref or external URL
const flexibleLink = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('internal'),
    label: z.string(),
    pageRef: z.string(), // Reference to pages collection (permalink)
    description: z.string().optional(),
  }),
  z.object({
    type: z.literal('external'),
    label: z.string(),
    externalUrl: z.url(),
    description: z.string().optional(),
  }),
]);

// Navigation item schema - single link or dropdown menu
const navigationItem = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('single'),
    link: flexibleLink,
  }),
  z.object({
    type: z.literal('dropdown'),
    label: z.string(),
    links: z.array(flexibleLink),
  }),
]);

const navigationCollection = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/navigation' }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    items: z.array(navigationItem),
  }),
});

const richCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  order: z.number(),
});

const categoriesCollection = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/categories' }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    categories: z.union([z.array(z.string()), z.array(richCategorySchema)]),
  }),
});

const homepageCollection = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/homepage' }),
  schema: ({ image }) => {
    const { sectionsSchema } = createSchemas(image);

    return z.object({
      title: z.string(),
      backgroundImage: image().optional(),
      stats: z.array(
        z.object({
          label: z.string(),
          value: z.string(),
        })
      ),
      sections: sectionsSchema,
    });
  },
});

const testsCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tests' }),
  schema: ({ image }) =>
    z.object({
      permalink: z.string(),
      title: z.string(),
      description: z.string().optional(),
      parentTest: z.string().optional(), // For nested tests (e.g., /tests/ndt/ for ndt5)
      testStatus: z
        .enum(['current', 'retired', 'core-service', 'retired-core-service'])
        .optional(),
      status: statusSchema,
      icon: image().optional(), // Icon image for tests index page
      order: z.number().optional().default(999),
      showInIndex: z.boolean().optional().default(true),
    }),
});

const publicationsCollection = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/publications' }),
  schema: z.object({
    // Core metadata
    id: z.string(),
    title: z.string(),
    status: statusSchema,
    description: z.string().optional(),
    authors: z.string().optional(), // Official citation string
    contributors: z.array(z.string()).optional(), // References to people collection IDs

    // Classification
    year: z.number(),
    category: z.enum(
      publicationsCategories.categories as [string, ...string[]]
    ),

    // Link types - ALL OPTIONAL, SUPPORTS MULTIPLE
    internalLinks: z
      .array(
        z.object({
          label: z.string(),
          path: z.string(),
        })
      )
      .optional(),

    externalLinks: z
      .array(
        z.object({
          label: z.string(),
          url: z.url(),
        })
      )
      .optional(),

    videoLinks: z
      .array(
        z.object({
          label: z.string(),
          url: z.url(),
          platform: z
            .enum(['youtube', 'vimeo', 'livestream', 'other'])
            .optional(),
        })
      )
      .optional(),

    // Additional metadata
    publishedDate: z.coerce.date().optional(),
    venue: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

// ---------------------------------------------------------------------------
// Dataset access point - describes one way to access a dataset
// (e.g. BigQuery table, GCS bucket, download URL)
// ---------------------------------------------------------------------------
const accessPointSchema = z.object({
  label: z.string(), // e.g. "BigQuery", "GCS"
  url: z.string(), // access URL or path
  format: z.string(), // e.g. "BigQuery", "Parquet", "CSV"
  type: z.enum(['query', 'download', 'api', 'viz']).optional(),
  description: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Datasets collection
//
// Dublin Core fields with M-Lab constants pre-populated at render time:
//   dc:creator / dc:publisher  → "Measurement Lab"
//   dc:language                → "en"
//   dc:type                    → "Dataset"
//   dc:rights / license        → "CC0 1.0 Universal"
//   dc:subject                 → ["Internet measurement", "Network performance",
//                                  "Broadband", "Open data"]
//
// These are intentionally absent from the CMS form to keep entry simple.
// ---------------------------------------------------------------------------
const datasetsCollection = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/datasets' }),
  schema: z.object({
    // Identity
    id: z.string(),
    title: z.string(), // dc:title
    status: statusSchema,

    // Description
    description: z.string(), // dc:description (plain text for JSON-LD)

    // Data category — used to group datasets on the catalog page
    // Sourced from src/content/categories/datasets.json — the same file the landing
    // page groups by and the CMS dropdown is generated from. Optional: an entry with
    // no category falls back to the "uncategorized" group at render time.
    category: z
      .enum(
        datasetCategories.categories.map((c) => c.id) as [string, ...string[]]
      )
      .optional(),

    // Provenance / relation
    testRef: z.string().optional(), // slug of associated M-Lab test
    relatedDatasets: z.array(z.string()).optional(), // slugs of related datasets

    // Temporal coverage
    temporalCoverageStart: z.string().optional(), // ISO date string e.g. "2009-01-01"
    temporalCoverageEnd: z.string().optional(), // ISO date string or "present"

    // Spatial coverage (defaults to "Global" at render time)
    spatialCoverage: z.string().optional().default('Global'),

    // Update cadence
    updateFrequency: z
      .enum(['continuous', 'daily', 'weekly', 'monthly', 'irregular', 'static'])
      .optional(),

    // Access points (BigQuery, GCS, download links, etc.)
    accessPoints: z.array(accessPointSchema).optional(),

    // Size hint (human-readable, e.g. "~500 GB/year")
    dataSize: z.string().optional(),

    // Dataset-specific search terms. Merged with the shared M-Lab base terms by
    // keywordsFor() in @utils/datasetSchema — do not repeat those here.
    keywords: z.array(z.string()).optional(),

    // Additional documentation / external links
    documentationLinks: z
      .array(z.object({ label: z.string(), url: z.string() }))
      .optional(),
  }),
});

export const collections = {
  people: peopleCollection,
  pages: pagesCollection,
  blog: blogCollection,
  site: siteCollection,
  navigation: navigationCollection,
  partners: partnersCollection,
  categories: categoriesCollection,
  homepage: homepageCollection,
  publications: publicationsCollection,
  tests: testsCollection,
  datasets: datasetsCollection,
};
