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
    <div
      className="block border-b-4 border-neutral-200 transition-all duration-200"
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

        <h3 className="text-xl font-bold md:text-2xl">
          <a
            href={`/publications/${post.id}`}
            className="block text-neutral-900 no-underline transition-all hover:text-primary-600"
          >
            {post.data.title}
          </a>
        </h3>

        {post.data.description && (
          <div
            className="line-clamp-3 grow text-neutral-600"
            dangerouslySetInnerHTML={{ __html: post.data.description }}
          />
        )}

        {/* Content Slot Area */}
        <div className="flex flex-col gap-3 border-t border-neutral-300 pt-2">
          {/* Authors from citation string or resolved contributors */}
          {(post.data.authors || authorNames) && (
            <p className="text-gray-700 text-base">
              <span className="font-medium">Authors:</span>{' '}
              {post.data.authors || authorNames}
            </p>
          )}

          {/* Venue */}
          {post.data.venue && (
            <p className="text-gray-700 text-base">
              <span className="font-medium">Venue:</span> {post.data.venue}
            </p>
          )}

          {/* Internal Links */}
          {post.data.internalLinks && (
            <div className="flex flex-wrap gap-2 pt-2">
              {post.data.internalLinks.map((link) => (
                <a
                  key={`${link.path}`}
                  href={`/${link.path}`}
                  className="text-md inline-flex items-center gap-2 text-primary-500 hover:text-primary-600"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconDownload className="h-6 w-6" />
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
