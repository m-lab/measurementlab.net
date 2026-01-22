import type { PublicationCardData } from '@utils/publications';
import PublicationItem from './PublicationItem';

interface PublicationItemsProps {
  items: PublicationCardData[];
}

export default function PublicationItems({ items }: PublicationItemsProps) {
  return (
    <div className="mx-auto w-full max-w-4xl overflow-hidden">
      {items.map((item) => (
        <div key={item.post.id} className="mx-6 mb-12 md:mx-0 md:mb-16">
          <PublicationItem item={item} />
        </div>
      ))}
    </div>
  );
}
