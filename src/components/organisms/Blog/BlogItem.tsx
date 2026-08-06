import Tag from '@components/atoms/Tag';
import type { BlogPostCardData } from '@utils/blog';
import { isDev } from '@utils/dev';

interface BlogItemProps {
  item: BlogPostCardData;
}

export default function BlogItem({ item }: BlogItemProps) {
  const { authorNames, formattedDate, post } = item;

  return (
    <a
      href={`/blog/${post.id}`}
      className="block border-b-4 border-neutral-200 text-neutral-600 no-underline transition-all duration-200"
      style={{
        maskImage: 'conic-gradient(from 45deg at 50px 50px, #000 75%, #0000 0)',
        maskPosition: '-50px',
      }}
    >
      <div className={`flex h-full flex-col gap-6 bg-white p-4`}>
        {/* Hero Image */}
        <div className="-m-4 mb-0 max-h-52 overflow-hidden">
          <img
            src={post.data.heroImage?.src}
            alt={post.data.title}
            className="w-full object-cover object-center"
          />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-neutral-900 md:text-2xl">
          {post.data.title}
        </h3>

        {/* Description placeholder */}

        <div
          className="line-clamp-4 grow justify-self-start text-neutral-600"
          style={{ content: '""' }}
        />

        {/* Content Slot Area */}
        <div className="flex flex-col">
          {/* Draft badge (only visible in dev) */}
          {isDev && post.data.status === 'draft' && (
            <div className="mb-3">
              <Tag variant="neutral" className="font-bold">
                DRAFT
              </Tag>
            </div>
          )}

          {/* Categories */}
          <div className="mb-3 flex flex-wrap gap-2">
            {post.data.categories.slice(0, 3).map((category) => (
              <Tag variant="primary" key={category}>
                {category}
              </Tag>
            ))}
          </div>

          {/* Metadata */}
          <div className="mb-4 space-y-1">
            <p className="text-neutral-600">By {authorNames}</p>
            <p className="text-neutral-400">{formattedDate}</p>
          </div>
        </div>
      </div>
    </a>
  );
}
