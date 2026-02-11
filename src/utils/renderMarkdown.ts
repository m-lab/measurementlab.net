import { getImage } from 'astro:assets';
import rehypeExtractToc, {
  type TocEntry,
} from '@stefanprobst/rehype-extract-toc';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeSlug from 'rehype-slug';
import rehypeExpressiveCode from 'rehype-expressive-code';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

// Eagerly import all images from /src/assets
const images: Record<string, ImageMetadata> = import.meta.glob(
  '/src/assets/**/*.{png,jpg,jpeg,gif,webp,svg}',
  {
    eager: true,
    import: 'default',
  }
);

const processImageNodes = () => async (tree: any) => {
  // Find all image nodes in the tree
  const imageNodes: any[] = [];
  visit(tree, 'element', (node) => {
    if (node.tagName === 'img') {
      imageNodes.push(node);
    }
  });

  // Process each image node with getImage
  const imagePromises = imageNodes.map(async (node) => {
    const src = node.properties?.src;
    const alt = node.properties?.alt ?? '';

    if (!src) {
      console.warn('Image node missing src attribute');
      return;
    }

    // Get the imported image from our glob map
    // Decode URL-encoded paths (e.g. %20 for spaces) to match glob keys
    const decodedSrc = decodeURIComponent(src);
    const importedImage = images[decodedSrc] ?? images[src];

    if (!importedImage) {
      console.warn(`Image not found in /src/assets: ${src}`);
      return;
    }

    try {
      const fetchedImage = await getImage({ src: importedImage });

      if (fetchedImage) {
        node.properties = {
          src: fetchedImage.src,
          alt,
          ...fetchedImage.attributes,
        };
      }
    } catch (error) {
      console.error(`Failed to process image with getImage: ${src}`, error);
    }
  });

  await Promise.all(imagePromises);
};

// Extract base markdown processor (no image processing)
const createMarkdownProcessor = (withTOC = false, id?: string) => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm) // Adds support for tables, strikethrough, task lists, etc.
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug, { prefix: `${id}-` });

  // Extract TOC before autolink headings appends the # symbol
  if (withTOC) {
    processor.use(rehypeExtractToc);
  }

  processor
    .use(rehypeAutolinkHeadings, {
      behavior: 'append',
      headingProperties: { class: 'heading-anchor-group' },
      properties: { class: 'heading-anchor', ariaHidden: true, tabIndex: -1 },
      content: {
        type: 'element',
        tagName: 'span',
        properties: { class: 'heading-anchor-icon' },
        children: [{ type: 'text', value: '#' }],
      },
    })
    .use(rehypeExternalLinks, {
      target: '_blank',
      rel: ['noopener', 'noreferrer'],
    })
    .use(rehypeRaw)
    .use(rehypeExpressiveCode, {
      themes: ['catppuccin-frappe'],
      defaultProps: {
        wrap: true,
        overridesByLang: {
          'bash,ps,sh': { preserveIndent: false },
        },
      },
    })
    .use(rehypeStringify);

  return processor;
};

export const renderMarkdown = async (
  markdown: string,
  withTOC = false,
  id?: string
): Promise<{ html: string; toc?: Array<TocEntry> }> => {
  const html = await createMarkdownProcessor(withTOC, id).process(markdown);
  return { html: String(html), toc: html.data.toc };
};

export const renderMarkdownWithImages = async (
  markdown: string,
  withTOC = false,
  id?: string
): Promise<{ html: string; toc?: Array<TocEntry> }> => {
  const html = await createMarkdownProcessor(withTOC, id)
    .use(processImageNodes)
    .process(markdown);

  return { html: String(html), toc: html.data.toc };
};

export default renderMarkdownWithImages;
