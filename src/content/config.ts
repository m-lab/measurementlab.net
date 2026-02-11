import { defineCollection, type ImageFunction, z } from 'astro:content';
import type { ImageMetadata } from 'astro';
import blogCategories from './categories/blog.json';
import partnerCategories from './categories/partners.json';
import peopleCategories from './categories/people.json';
import publicationsCategories from './categories/publications.json';

//  TODO: #5 create Projects content collection

// Shared status field for content visibility across all collections
const statusSchema = z.enum(['draft', 'published', 'archived']).default('draft');

// Shared color palette enum matching the site's design tokens
const colorPaletteSchema = z.enum([
  'primary',
  'secondary',
  'supporting1',
  'supporting2',
  'neutral',
  'speed',
]);

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
  icon: z.enum(['measurement', 'insights', 'community', 'mlab-blue', 'mlab-white']).optional(),
});

export type ButtonType = z.infer<typeof buttonSchema>;
export type CardType = z.infer<typeof cardBaseSchema> & { image?: ImageMetadata };

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
        color: z
          .enum([
            'white',
            'gray',
            'primary-light',
            'primary-medium',
            'primary-dark',
          ])
          .default('white'),
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
        .enum([
          'primary-light',
          'primary-dark',
          'secondary-light',
          'secondary-dark',
          'supporting1-light',
          'supporting1-dark',
          'supporting2-light',
          'supporting2-dark',
        ])
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
      category: z.string().optional(),
    }),
    SectionCommonSchema.extend({
      type: z.literal('partners'),
      title: z.string(),
      category: z.string().optional(),
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
    // status map section for /status page
    SectionCommonSchema.extend({
      type: z.literal('infrastructureMap'),
      title: z.string().default('Infrastructure Map'),
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
  type: 'data',
  schema: ({ image }) => {
    const { sectionsSchema } = createSchemas(image);

    return z.object({
      title: z.string(),
      description: z.string().optional(),
      heroImage: image().optional(),
      permalink: z.string(),
      status: statusSchema,
      zigzag: z
        .enum([
          'primary-light',
          'primary-dark',
          'secondary-light',
          'secondary-dark',
          'supporting1-light',
          'supporting1-dark',
          'supporting2-light',
          'supporting2-dark',
        ])
        .optional(),
      sections: sectionsSchema.optional(),
    });
  },
});

const peopleCollection = defineCollection({
  type: 'data',
  schema: ({ image }) => createSchemas(image).personSchema,
});

const partnersCollection = defineCollection({
  type: 'data',
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
  type: 'content',
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
  type: 'data',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      url: z.string().url(),
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
      archivedBanner: z.object({
        message: z.string(),
        color: colorPaletteSchema,
      }).optional(),
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
    externalUrl: z.string().url(),
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
  type: 'data',
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    items: z.array(navigationItem),
  }),
});

const categoriesCollection = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    name: z.string(),
    categories: z.array(z.string()),
  }),
});

const homepageCollection = defineCollection({
  type: 'data',
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
  type: 'content',
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
  type: 'data',
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
          url: z.string().url(),
        })
      )
      .optional(),

    videoLinks: z
      .array(
        z.object({
          label: z.string(),
          url: z.string().url(),
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
};
