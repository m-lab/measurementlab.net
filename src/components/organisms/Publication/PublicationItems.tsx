import PublicationItem from './PublicationItem';
import type { PublicationCardData } from '@utils/publications';

interface PublicationItemsProps {
	items: PublicationCardData[];
}

export default function PublicationItems({ items }: PublicationItemsProps) {
	return (
		<div className="grid gap-6 max-w-4xl mx-auto">
			{items.map((item, index) => (
				<PublicationItem key={index} item={item} />
			))}
		</div>
	);
}
