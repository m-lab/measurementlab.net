import PublicationItem from './PublicationItem';
import type { PublicationCardData } from '@utils/publications';

interface PublicationItemsProps {
	items: PublicationCardData[];
}

export default function PublicationItems({ items }: PublicationItemsProps) {
	return (
		<div className="grid gap-6">
			{items.map((item) => (
				<PublicationItem key={item.publication.id} item={item} />
			))}
		</div>
	);
}
