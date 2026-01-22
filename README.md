# Measurement Lab Website

The official website for [Measurement Lab](https://measurementlab.net), an open-source project providing Internet performance measurement tools and data.

## Quick Start

```bash
npm install
npm run dev      # Development server at localhost:4321
npm run build    # Production build
npm run preview  # Preview production build
```

## Tech Stack

- **Astro 5.16** - Static site generation
- **Tailwind CSS 4** - Utility-first styling
- **React 19** - Interactive components
- **Pages CMS** - Git-based content management

## Project Structure

```
src/
├── assets/          # Images, logos, icons
├── components/
│   ├── atoms/       # Basic elements (Button, Link, Tag, Text, Heading)
│   ├── molecules/   # Compound components (Card, FormField, NavItem)
│   ├── organisms/   # Complex components (Navigation, Footer, Hero, Search)
│   ├── sections/    # Page section templates
│   └── landing/     # Custom landing page components (blog, publications)
├── content/         # All CMS-managed content (see below)
├── layouts/         # Page layout templates
├── lib/             # Shared libraries and utilities
├── pages/           # Route definitions
├── styles/          # Tailwind CSS configuration
└── utils/           # Helper functions
```

## Content Collections

All content lives in `src/content/` with type-safe schemas defined in `src/content/config.ts`.

| Collection      | Format   | Purpose                                                  |
| --------------- | -------- | -------------------------------------------------------- |
| `pages/`        | YAML     | Static pages (about, contact, policies, etc.)            |
| `blog/`         | Markdown | Blog posts with frontmatter                              |
| `publications/` | JSON     | Research publications, papers, presentations             |
| `people/`       | JSON     | Team member profiles                                     |
| `partners/`     | JSON     | Partner organizations                                    |
| `tests/`        | Markdown | M-Lab test documentation                                 |
| `navigation/`   | JSON     | Menu structure (main.json, footer-1.json, footer-2.json) |
| `site/`         | JSON     | Global site configuration (config.json, _redirects.json) |
| `homepage/`     | YAML     | Homepage-specific content                                |
| `categories/`   | JSON     | Category definitions for blog, people, partners, publications |

## Page Sections

Pages use a flexible section-based system. Each page YAML file contains a `sections` array where you compose the page from available section types.

### Available Section Types

| Type               | Component               | Purpose                                          |
| ------------------ | ----------------------- | ------------------------------------------------ |
| `hero`             | HeroSection             | Page title with optional zigzag background       |
| `richText`         | RichTextSection         | Markdown content with optional table of contents |
| `button`           | ButtonSection           | Call-to-action buttons                           |
| `card`             | CardSection             | Card grid layouts                                |
| `people`           | PeopleSection           | Team member listings (filtered by category)      |
| `partners`         | PartnersSection         | Partner organization display                     |
| `blog_roll`        | BlogRollSection         | Latest blog posts (configurable limit)           |
| `speed_test`       | SpeedTestSection        | M-Lab speed test widget                          |
| `featured_partners`| FeaturedPartnersSection | Partner spotlight                                |
| `flexi`            | FlexiSection            | Nested section container                         |

### Section Backgrounds

All sections support a `background` property:

```yaml
background:
  color: white  # Options: white, gray, primary-light, primary-medium, primary-dark
  image: /src/assets/my-image.jpg  # Optional background image
```

### Zigzag Decorations

Hero sections support zigzag decorative backgrounds:

```yaml
zigzag: primary-light  # Options: primary-light, primary-dark, secondary-light,
                       # secondary-dark, supporting1-light, supporting1-dark,
                       # supporting2-light, supporting2-dark
```

## Navigation Structure

Navigation is defined in JSON files in `src/content/navigation/`:

- **main.json** - Primary site navigation
- **footer-1.json** - First footer column
- **footer-2.json** - Second footer column

Navigation items can be:
- **Single links** - Direct link to a page or external URL
- **Dropdowns** - Menu with multiple links

Links can reference internal pages by `pageRef` (using the page's permalink) or external URLs.

## Categories

Categories are defined in `src/content/categories/` and control filtering/grouping:

| File | Used For | Values |
|------|----------|--------|
| `blog.json` | Blog post categories | Technology, Development, Design, Product, Business, Tutorial, News, Opinion |
| `people.json` | Team member sections | Maintainers, Experiment Review Committee, Advisory Committee, M-Lab Founders |
| `partners.json` | Partner groupings | Supporting Research Projects, Supporting Partners |
| `publications.json` | Publication types | paper, regulatory-filing, presentation, documentation |

## Deployment

- **Hosting:** Netlify
- **Auto-deploy:** Pushes to `main` branch trigger automatic deployment
- **Redirects:** Configured in `src/content/site/_redirects.json`

## Content Management

**Pages CMS is the recommended way to edit content.** It provides a visual interface that makes editing easier and reduces the chance of syntax errors. However, all content can also be edited directly in the repository files.

### Using Pages CMS (Recommended)

1. Go to [app.pagescms.org](https://app.pagescms.org)
2. Log in with your GitHub account
3. Select the Measurement Lab repository
4. Edit content through the visual interface
5. Changes are committed directly to Git

CMS configuration is defined in `.pages.yml` at the project root.

### Direct File Editing

You can also edit content files directly in the repository. This is useful for:
- Bulk changes
- Complex edits not supported by the CMS
- Working offline

---

## Content Editing Reference

This section provides templates and examples for directly editing content files.

### Blog Posts

Create a new `.md` file in `src/content/blog/`:

```markdown
---
permalink: my-new-post
title: My New Blog Post
excerpt: A brief description of the post
authors:
  - chris-ritzo
published: published
tags:
  - research
  - data
categories:
  - News
publishedDate: 2025-01-15
---

Your markdown content here...
```

**Required fields:**
- `permalink` - URL slug (no leading slash)
- `title` - Post title
- `authors` - Array of people IDs from `src/content/people/`
- `published` - Either `draft` or `published`
- `tags` - Array of tag strings
- `publishedDate` - Date in YYYY-MM-DD format

**Optional fields:**
- `excerpt` - Short description for previews
- `categories` - Array from: Technology, Development, Design, Product, Business, Tutorial, News, Opinion
- `heroImage` - Path to hero image
- `externalAuthors` - Comma-separated names for non-M-Lab authors
- `relatedPosts` - Array of up to 3 blog post permalinks

### Pages

Create a new `.yaml` file in `src/content/pages/`:

```yaml
title: My New Page
permalink: my-page
sections:
  - type: hero
    title: Page Title
    zigzag: primary-light
    background:
      color: primary-medium

  - type: richText
    background:
      color: white
    withTOC: true
    content: |
      # Main Heading

      Your markdown content here...

      ## Subheading

      More content...

  - type: people
    category: Maintainers
    background:
      color: gray

  - type: blog_roll
    title: Latest News
    limit: 3
    showMore: true
```

### Team Members (People)

Create a new `.json` file in `src/content/people/`:

```json
{
  "id": "jane-smith",
  "name": "Jane Smith",
  "headshot": "/src/assets/people/jane-smith.jpg",
  "title": "Research Director",
  "affiliation": "Measurement Lab",
  "sections": ["Maintainers"]
}
```

**Required fields:**
- `id` - Unique identifier (should match filename without extension)
- `name` - Display name
- `headshot` - Path to headshot image
- `sections` - Array from: Maintainers, Experiment Review Committee, Advisory Committee, M-Lab Founders

**Optional fields:**
- `title` - Job title
- `affiliation` - Organization name
- `extraInfo` - Additional info
- `url` - Personal/professional URL

### Partners

Create a new `.json` file in `src/content/partners/`:

```json
{
  "id": "example-partner",
  "name": "Example Partner",
  "url": "https://example.com",
  "category": "Supporting Partners",
  "image": "/src/assets/partners/example.png",
  "order": 10
}
```

**Required fields:**
- `id` - Unique identifier
- `name` - Organization name
- `category` - Either "Supporting Research Projects" or "Supporting Partners"

**Optional fields:**
- `url` - Partner website
- `image` - Path to logo image
- `affiliation` - Additional affiliation info
- `order` - Sort order (lower numbers appear first, default 999)

### Publications

Create a new `.json` file in `src/content/publications/`:

```json
{
  "id": "2025-example-paper",
  "title": "Example Research Paper",
  "description": "Brief description of the publication",
  "authors": "Smith, J., Johnson, A., Williams, B.",
  "contributors": ["jane-smith"],
  "year": 2025,
  "category": "paper",
  "venue": "ACM SIGCOMM",
  "publishedDate": "2025-03-15",
  "externalLinks": [
    {
      "label": "PDF",
      "url": "https://example.com/paper.pdf"
    }
  ],
  "tags": ["research", "measurement"]
}
```

**Required fields:**
- `id` - Unique identifier
- `title` - Publication title
- `year` - Publication year
- `category` - One of: paper, regulatory-filing, presentation, documentation

**Optional fields:**
- `description` - Brief summary
- `authors` - Citation string for all authors
- `contributors` - Array of people IDs from `src/content/people/` (for M-Lab team members)
- `venue` - Conference/journal name
- `publishedDate` - Full date
- `internalLinks` - Array of `{label, path}` for internal site links
- `externalLinks` - Array of `{label, url}` for external links
- `videoLinks` - Array of `{label, url, platform}` for video content
- `tags` - Array of tag strings
- `order` - Sort order

### Tests

Create a new `.md` file in `src/content/tests/`:

```markdown
---
permalink: /tests/my-test/
title: "My Test"
description: "Brief description of the test"
status: current
icon: /src/assets/images/tests/my-test.png
order: 10
showInIndex: true
---

# My Test

Full markdown documentation for the test...
```

**Required fields:**
- `permalink` - URL path (should start with `/tests/`)
- `title` - Test name

**Optional fields:**
- `description` - Brief description
- `status` - One of: current, retired, core-service, retired-core-service
- `icon` - Path to icon image for tests index
- `order` - Sort order (default 999)
- `showInIndex` - Whether to show on tests index page (default true)
- `parentTest` - Parent test permalink for nested tests

### Navigation

Edit `src/content/navigation/main.json`:

```json
{
  "slug": "main",
  "title": "Main Navigation",
  "items": [
    {
      "type": "single",
      "link": {
        "type": "internal",
        "label": "About",
        "pageRef": "about"
      }
    },
    {
      "type": "dropdown",
      "label": "Resources",
      "links": [
        {
          "type": "internal",
          "label": "Publications",
          "pageRef": "publications",
          "description": "Research papers and presentations"
        },
        {
          "type": "external",
          "label": "GitHub",
          "externalUrl": "https://github.com/m-lab"
        }
      ]
    }
  ]
}
```

### Site Configuration

Edit `src/content/site/config.json`:

```json
{
  "title": "Measurement Lab",
  "description": "Site description for SEO",
  "url": "https://measurementlab.net",
  "favicon": "/favicon.svg",
  "defaultOgImage": "/src/assets/og-image.png",
  "defaultLogoLight": "/src/assets/logo-light.svg",
  "defaultLogoDark": "/src/assets/logo-dark.svg",
  "social": {
    "github": "https://github.com/m-lab",
    "x": "https://x.com/measurementlab",
    "linkedin": "https://www.linkedin.com/company/measurementlab"
  },
  "footer": {
    "description": "Footer description text (supports markdown links)",
    "bottom": "Copyright and license text (supports markdown links)"
  }
}
```

---

## Development Notes

### Adding New Content Types

1. Define the schema in `src/content/config.ts`
2. Create the collection folder in `src/content/`
3. Add category definitions in `src/content/categories/` if needed
4. Update Pages CMS config in `.pages.yml` for visual editing

### Creating New Section Types

1. Create component in `src/components/sections/`
2. Register in `src/components/sections/Sections.astro`
3. Add to `sectionsSchema` in `src/content/config.ts`

## Useful Links

- [Astro Documentation](https://docs.astro.build)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Pages CMS Documentation](https://pagescms.org/docs)
- [React Documentation](https://react.dev)
