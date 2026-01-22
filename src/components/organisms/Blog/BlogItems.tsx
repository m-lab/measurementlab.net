import type { BlogPostCardData } from '@utils/blog';

import BlogItem from './BlogItem';

interface BlogItemsProps {
  items: BlogPostCardData[]; // Define BlogPost type according to your data structure
}

export default function BlogItems({ items }: BlogItemsProps) {
  return (
    <div className="mx-6 xl:mx-0">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <BlogItem key={item.post.id} item={item} />
        ))}
      </div>
    </div>
  );
}
