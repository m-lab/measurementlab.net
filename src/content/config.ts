import { defineCollection, type ImageFunction, z } from 'astro:content';
import blogCategories from './categories/blog.json';
import partnerCategories from './categories/partners.json';
import peopleCategories from './categories/people.json';

// Helper to create schemas with image support
const createSchemas = (image: ImageFunction) => {
  // Atoms
  const buttonSchema = z.object({
    variant: z.string(),
    size: z.string(),
    href: z.string(),
    text: z.string(),
  });

  // Organisms

  // Card
  const cardSchema = z.object({
    title: z.string(),
    content: z.string().optional(),
    image: image().optional(),
    button: buttonSchema.optional(),
  });

  //  Person
  const personSchema = z.object({
    id: z.string(),
    name: z.string(),
    headshot: image(),
    title: z.string(),
    sections: z.array(
      z.enum(peopleCategories.categories as [string, ...string[]])
    ),
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
            'primary-mediumm',
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
  ]);

  const flexiSectionSchema = SectionCommonSchema.extend({
    type: z.literal('flexi'),
    title: z.string(),
    description: z.string().optional(),
    sections: z.array(sectionsSchema),
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
      sections: sectionsSchema,
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
      authors: z.array(z.string()), // References to people collection IDs
      published: z.enum(['draft', 'published']),
      tags: z.array(z.string()),
      categories: z
        .array(z.enum(blogCategories.categories as [string, ...string[]]))
        .optional(),
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
    }),
});

const navigationCollection = defineCollection({
  type: 'data',
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    items: z.array(
      z.object({
        label: z.string(),
        href: z.string(),
        description: z.string().optional(),
      })
    ),
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

export const collections = {
  people: peopleCollection,
  pages: pagesCollection,
  blog: blogCollection,
  site: siteCollection,
  navigation: navigationCollection,
  partners: partnersCollection,
  categories: categoriesCollection,
  homepage: homepageCollection,
};
