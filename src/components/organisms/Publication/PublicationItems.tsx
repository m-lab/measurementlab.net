import PublicationItem from './PublicationItem';
import type { PublicationCardData } from '@utils/publications';

interface PublicationItemsProps {
	items: PublicationCardData[];
}

export default function PublicationItems({ items }: PublicationItemsProps) {
	return (
		<div className="max-w-4xl mx-auto w-full overflow-hidden">
			{items.map((item, index) => (
				<div key={index} className="mb-12 md:mb-16 mx-6 md:mx-0">
					<PublicationItem item={item} />
				</div>
			))}
		</div>
	);
}
