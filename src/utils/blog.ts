import { getImage } from 'astro:assets';
import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import MlabDefault from '@assets/mlab-default-card.png';
import { isVisible } from '@utils/content';
import {
  getAllAuthorNames,
  getPeopleMap,
  type PersonData,
  resolvePeople,
} from '@utils/people';
import type { ImageMetadata } from 'astro';

export type BlogPost = CollectionEntry<'blog'>;

/**
 * Pre-resized hero image for card rendering. BlogItem is a React component, so
 * it can't call Astro's image pipeline itself — without this it fell back to
 * `heroImage.src`, which is the untouched original (up to 4000px / 1.2MB).
 */
export interface BlogCardImage {
  src: string;
  width: number;
  height: number;
}

/** Cards render at roughly 400px wide; 2x covers retina. */
const CARD_IMAGE_WIDTH = 800;

export interface BlogPostCardData {
  post: BlogPost;
  authorNames: string;
  formattedDate: string;
  heroImage: BlogCardImage;
}

export interface BlogPostWithAuthors extends BlogPost {
  resolvedAuthors: PersonData[];
}

export interface GetBlogPostsOptions {
  limit?: number;
  filterByStatus?: boolean;
  sortBy?: 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface GetRelatedPostsOptions {
  limit?: number;
  peopleMap?: Map<string, PersonData>;
}

/**
 * Fetches and filters blog posts based on environment
 * @param options - Configuration options
 * @returns Filtered and sorted blog posts
 */
export async function getBlogPosts(
  options?: GetBlogPostsOptions
): Promise<BlogPost[]> {
  const allPosts = await getCollection('blog');
  const shouldFilter = options?.filterByStatus ?? true;

  let filtered = shouldFilter
    ? allPosts.filter((post) => isVisible(post))
    : allPosts;

  const sortBy = options?.sortBy ?? 'date';
  const sortOrder = options?.sortOrder ?? 'desc';

  filtered = filtered.sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'date') {
      comparison =
        a.data.publishedDate.getTime() - b.data.publishedDate.getTime();
    } else {
      comparison = a.data.title.localeCompare(b.data.title);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return options?.limit ? filtered.slice(0, options.limit) : filtered;
}

/**
 * Formats a date for blog display
 * @param date - The date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatBlogDate(
  date: Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat('en-US', options ?? defaultOptions).format(
    date
  );
}

/**
 * Prepares blog post data for card rendering
 * @param post - The blog post
 * @param peopleMap - Optional pre-built people map
 * @returns Data ready for card rendering
 */
export async function prepareBlogPostCardData(
  post: BlogPost,
  peopleMap?: Map<string, PersonData>
): Promise<BlogPostCardData> {
  const heroImage = (post.data.heroImage || MlabDefault) as ImageMetadata;

  // Never upscale, and keep the source aspect ratio so the rendered box is
  // unchanged — the explicit width/height also removes the card's CLS.
  const width = Math.min(CARD_IMAGE_WIDTH, heroImage.width);
  const height = Math.round(heroImage.height * (width / heroImage.width));
  const optimized = await getImage({ src: heroImage, width, height });

  // `body` is the post's full markdown. Card rendering never reads it, but
  // FilterableContent is a client island, so anything left on this object gets
  // serialised into an astro-island props attribute — that alone was 2.8MB of
  // the /blog HTML. `rendered` is dropped for the same reason.
  const { body: _body, rendered: _rendered, ...cardPost } = post;

  return {
    post: {
      ...cardPost,
      data: {
        ...post.data,
        heroImage,
      },
    } as BlogPost,
    heroImage: { src: optimized.src, width, height },
    authorNames: await getAllAuthorNames(
      post.data.authors,
      post.data.externalAuthors,
      peopleMap
    ),
    formattedDate: formatBlogDate(post.data.publishedDate),
  };
}

/**
 * Prepares multiple blog posts for card rendering (more efficient)
 * @param posts - Array of blog posts
 * @returns Array of data ready for card rendering
 */
export async function prepareBlogPostsCardData(
  posts: BlogPost[]
): Promise<BlogPostCardData[]> {
  const peopleMap = await getPeopleMap(); // Single fetch for all posts

  return Promise.all(
    posts.map((post) => prepareBlogPostCardData(post, peopleMap))
  );
}

/**
 * Resolves an ordered list of blog post permalinks to posts
 * Only visible posts are returned; unknown permalinks are skipped with a warning
 * @param permalinks - Blog post permalinks, in the order they should appear
 * @returns Matching posts in the given order
 */
export async function getPostsByPermalinks(
  permalinks: string[]
): Promise<BlogPost[]> {
  if (!permalinks?.length) return [];

  const allPosts = await getBlogPosts();

  return permalinks
    .map((permalink) => {
      const post = allPosts.find((p) => p.data.permalink === permalink);
      if (!post) {
        console.warn(`Blog post not found or not visible: ${permalink}`);
      }
      return post;
    })
    .filter((post): post is BlogPost => post !== undefined);
}

/**
 * Gets related posts based on manual selection and tag matching
 * @param currentPost - The current blog post
 * @param options - Configuration options
 * @returns Array of related posts with resolved authors
 */
export async function getRelatedPosts(
  currentPost: BlogPost,
  options?: GetRelatedPostsOptions
): Promise<BlogPostWithAuthors[]> {
  const limit = options?.limit ?? 3;
  const allPosts = await getBlogPosts();
  const peopleMap = options?.peopleMap ?? (await getPeopleMap());

  // Get manually selected posts
  let relatedPosts: BlogPostWithAuthors[] = [];

  if (currentPost.data.relatedPosts) {
    const manualPosts = await Promise.all(
      currentPost.data.relatedPosts
        .filter((permalink) => permalink !== currentPost.data.permalink)
        .map(async (permalink) => {
          const post = allPosts.find((p) => p.data.permalink === permalink);
          if (!post) {
            console.warn(`Related post not found: ${permalink}`);
            return null;
          }
          return {
            ...post,
            resolvedAuthors: await resolvePeople(post.data.authors, peopleMap),
          };
        })
    );

    relatedPosts = manualPosts.filter(
      (post): post is BlogPostWithAuthors => post !== null
    );
  }

  // Fill remaining slots with tag-based recommendations
  if (relatedPosts.length < limit) {
    const currentCategories = new Set(currentPost.data.categories);
    const manuallySelectedPermalinks = new Set(
      relatedPosts.map((p) => p.data.permalink)
    );

    const candidatePosts = await Promise.all(
      allPosts
        .filter(
          (p) =>
            p.data.permalink !== currentPost.data.permalink &&
            !manuallySelectedPermalinks.has(p.data.permalink)
        )
        .map(async (p) => {
          const matchingCategories = p.data.categories.filter((cat) =>
            currentCategories.has(cat)
          ).length;
          return {
            ...p,
            resolvedAuthors: await resolvePeople(p.data.authors, peopleMap),
            matchingCategories,
          };
        })
    );

    const sortedCandidates = candidatePosts.sort((a, b) => {
      if (b.matchingCategories !== a.matchingCategories) {
        return b.matchingCategories - a.matchingCategories;
      }
      return b.data.publishedDate.getTime() - a.data.publishedDate.getTime();
    });

    const postsNeeded = limit - relatedPosts.length;
    relatedPosts = [...relatedPosts, ...sortedCandidates.slice(0, postsNeeded)];
  }

  return relatedPosts;
}
