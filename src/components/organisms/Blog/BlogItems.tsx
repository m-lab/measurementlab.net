import type { BlogPostCardData } from '@utils/blog';

import BlogItem from "./BlogItem";

interface BlogItemsProps {
  items: BlogPostCardData[]; // Define BlogPost type according to your data structure
}

export default function BlogItems({
	items
}: BlogItemsProps) {
	return (
    <div className="mx-6 xl:mx-0">
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
        {items.map((item, index) => (
          <BlogItem key={index} item={item} />
        ))}
      </div>
    </div>
    
	);
}
