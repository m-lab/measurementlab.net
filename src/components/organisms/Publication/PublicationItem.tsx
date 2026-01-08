import type { PublicationCardData } from '@utils/publications';
import { formatCategory } from '@utils/publications';
import IconDownload from '~icons/heroicons/document-arrow-down-solid';

interface PublicationItemProps {
	item: PublicationCardData;
}

export default function PublicationItem({ item }: PublicationItemProps) {
	const { publication, formattedYear } = item;

	return (
		<a
			href={`/publications/${publication.id}`}
			className="block transition-all border-neutral-200 text-neutral-600 border-b-4 no-underline duration-200"
			style={{
				maskImage: 'conic-gradient(from 45deg at 50px 50px, #000 75%, #0000 0)',
				maskPosition: '-50px',
			}}
		>
			<div className="flex h-full flex-col gap-6 bg-white p-4">
				{/* Category, Year, and Tags */}
				<div className="flex flex-wrap items-center gap-2">
					<span className="tag-base tag-primary tag-size-sm">
						{formatCategory(publication.data.category)}
					</span>
					<span className="tag-base tag-secondary tag-size-sm">
						{formattedYear}
					</span>
					{publication.data.tags &&
						publication.data.tags.slice(0, 2).map((tag) => (
							<span key={tag} className="tag-base tag-primary tag-size-sm">
								{tag}
							</span>
						))}
				</div>

				{/* Title */}
				<h3 className="text-xl font-bold text-neutral-900 md:text-2xl">
					{publication.data.title}
				</h3>

				{/* Description */}
				{publication.data.description && (
					<p className="grow line-clamp-3 text-neutral-600">
						{publication.data.description}
					</p>
				)}

				{/* Content Slot Area */}
				<div className="flex flex-col gap-3">
					{/* Authors */}
					{publication.data.authors && (
						<p className="text-gray-700 text-sm">
							<span className="font-medium">Authors:</span>{' '}
							{publication.data.authors}
						</p>
					)}

					{/* Venue */}
					{publication.data.venue && (
						<p className="text-gray-700 text-sm">
							<span className="font-medium">Venue:</span> {publication.data.venue}
						</p>
					)}

					{/* Internal Links */}
					{publication.data.internalLinks && (
						<div className="flex flex-wrap gap-2">
							{publication.data.internalLinks.map((link, index) => (
								<a
									key={index}
									href={`/${link.path}`}
									className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 text-sm"
									onClick={(e) => e.stopPropagation()}
								>
									<IconDownload className="h-4 w-4" />
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
