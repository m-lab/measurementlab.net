import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import MlabDefault from '@assets/mlab-default-card.png';
import { isDev } from '@utils/dev';
import {
  getAllAuthorNames,
  getPeopleMap,
  type PersonData,
  resolvePeople,
} from '@utils/people';
import type { ImageMetadata } from 'astro';

export type BlogPost = CollectionEntry<'blog'>;

export interface BlogPostCardData {
  post: BlogPost;
  authorNames: string;
  formattedDate: string;
}

export interface BlogPostWithAuthors extends BlogPost {
  resolvedAuthors: PersonData[];
}

export interface GetBlogPostsOptions {
  limit?: number;
  filterDrafts?: boolean;
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
  const shouldFilterDrafts = options?.filterDrafts ?? !isDev;

  let filtered = shouldFilterDrafts
    ? allPosts.filter((post) => post.data.published === 'published')
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
  const heroImage = post.data.heroImage || MlabDefault;

  return {
    post: {
      ...post,
      data: {
        ...post.data,
        heroImage: heroImage as ImageMetadata,
      },
    },
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
