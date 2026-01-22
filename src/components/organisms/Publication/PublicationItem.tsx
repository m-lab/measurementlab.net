import Tag from '@components/atoms/Tag';
import type { PublicationCardData } from '@utils/publications';
// import { formatCategory } from '@utils/publications';
import IconDownload from '~icons/heroicons/document-arrow-down-solid';

interface PublicationItemProps {
  item: PublicationCardData;
}

/**
 * Format category for display (e.g., "research-papers" -> "Research Papers")
 */
export function formatCategory(category: string): string {
  return category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function PublicationItem({ item }: PublicationItemProps) {
  const { post, authorNames } = item;

  return (
    <a
      href={`/publications/${post.id}`}
      className="block border-b-4 border-neutral-200 text-neutral-600 no-underline transition-all duration-200"
      style={{
        maskImage: 'conic-gradient(from 45deg at 50px 50px, #000 75%, #0000 0)',
        maskPosition: '-50px',
      }}
    >
      <div className="flex h-full flex-col gap-6 bg-neutral-100 px-16 py-12">
        {/* Category, Year, and Tags */}
        <div className="flex flex-wrap items-center gap-2">
          <Tag variant="primary">{formatCategory(post.data.category)}</Tag>
          <Tag variant="secondary">{post.data.year}</Tag>

          {post.data.tags?.slice(0, 2).map((tag) => (
            <Tag key={tag} variant="primary">
              {tag}
            </Tag>
          ))}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-neutral-900 md:text-2xl">
          {post.data.title}
        </h3>

        {/* Description */}
        {post.data.description && (
          <p
            className="line-clamp-3 grow text-neutral-600"
            dangerouslySetInnerHTML={{ __html: post.data.description }}
          />
        )}

        {/* Content Slot Area */}
        <div className="flex flex-col gap-3">
          {/* Authors from citation string or resolved contributors */}
          {(post.data.authors || authorNames) && (
            <p className="text-gray-700 text-sm">
              <span className="font-medium">Authors:</span>{' '}
              {post.data.authors || authorNames}
            </p>
          )}

          {/* Venue */}
          {post.data.venue && (
            <p className="text-gray-700 text-sm">
              <span className="font-medium">Venue:</span> {post.data.venue}
            </p>
          )}

          {/* Internal Links */}
          {post.data.internalLinks && (
            <div className="flex flex-wrap gap-2">
              {post.data.internalLinks.map((link, index) => (
                <a
                  key={`${link.path}:${index}`}
                  href={`/${link.path}`}
                  className="inline-flex items-center gap-2 text-sm text-primary-500 hover:text-primary-600"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconDownload class="h-4 w-4" />
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
