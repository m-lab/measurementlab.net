import type { BlogPostCardData } from '@utils/blog';

interface BlogItemProps {
	item: BlogPostCardData;
	mlabDefaultImage: any;
	isDev: boolean;
	variant?: 'primary' | 'secondary' | 'supporting1' | 'supporting2' | 'speed' | 'neutral';
}

export default function BlogItem({
	item,
	isDev,
	variant = 'primary',
}: BlogItemProps) {
	const variantColors = {
		primary: 'bg-white',
		secondary: 'bg-secondary-50 hover:bg-secondary-100',
		supporting1: 'bg-supporting1-50 hover:bg-supporting1-100',
		supporting2: 'bg-supporting2-50 hover:bg-supporting2-100',
		speed: 'bg-speed-50 hover:bg-speed-100',
		neutral: 'bg-neutral-100',
	};

	const { authorNames, formattedDate, post } = item;

	return (
		<a
			href={`/blog/${post.slug}`}
			className="block transition-all border-neutral-200 text-neutral-600 border-b-4 no-underline duration-200"
			style={{
				maskImage: 'conic-gradient(from 45deg at 50px 50px, #000 75%, #0000 0)',
				maskPosition: '-50px',
			}}
		>
			<div
				className={`flex h-full flex-col gap-6 ${variantColors[variant]} p-4 ${
					!post.data.heroImage ? 'pt-18' : ''
				}`}
			>
				{/* Hero Image */}
				{post.data.heroImage && (
					<div className="-m-4 mb-0 max-h-52 overflow-hidden">
						<img
							src={post.data.heroImage.src}
							alt={post.data.title}
							className="object-cover object-center w-full"
						/>
					</div>
				)}

				{/* Title */}
				<h3 className="text-xl font-bold text-neutral-900 md:text-2xl">
					{post.data.title}
				</h3>

				{/* Description/Excerpt */}
				{post.data.excerpt && (
					<div
						className="grow justify-self-start line-clamp-4 text-neutral-600"
						dangerouslySetInnerHTML={{ __html: post.data.excerpt }}
					/>
				)}

				{/* Content Slot Area */}
				<div className="flex flex-col">
					{/* Draft badge (only visible in dev) */}
					{isDev && post.data.published === 'draft' && (
						<div className="mb-3">
							<span className="tag-base tag-highlight tag-size-sm font-bold">
								DRAFT
							</span>
						</div>
					)}

					{/* Tags */}
					<div className="mb-3 flex flex-wrap gap-2">
						{post.data.tags.slice(0, 3).map((tag) => (
							<span key={tag} className="tag-base tag-primary tag-size-sm">
								{tag}
							</span>
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
