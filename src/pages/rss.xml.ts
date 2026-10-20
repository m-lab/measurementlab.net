import rss from '@astrojs/rss';
import { siteConfig } from '@lib/config';
import { getBlogPosts } from '@utils/blog';
import { toPlainText } from '@utils/seo';
import type { APIContext } from 'astro';

/**
 * /rss.xml — visible blog posts, newest first. Each item carries the post's
 * plain-text excerpt rather than the rendered body, so the feed needs no
 * markdown pipeline. Drafts follow the usual visibility rules.
 */
export async function GET(context: APIContext) {
  const posts = await getBlogPosts();

  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: context.site ?? siteConfig.url,
    items: posts.map((post) => ({
      title: post.data.title,
      link: `/blog/${post.id}`,
      pubDate: post.data.publishedDate,
      description: post.data.excerpt ? toPlainText(post.data.excerpt) : undefined,
      categories: post.data.categories,
    })),
    customData: '<language>en</language>',
  });
}
