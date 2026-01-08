import type { BlogPostCardData } from '@utils/blog';
import MlabDefault from '@assets/mlab-default-card.png';
import { isDev } from '@utils/dev';


interface BlogItemProps {
	item: BlogPostCardData;
}

export default function BlogItem({
	item,
}: BlogItemProps) {

	const { authorNames, formattedDate, post } = item;

	const heroImage = post.data.heroImage || MlabDefault;
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
				className={`flex h-full flex-col gap-6 bg-white p-4`}
			>
				{/* Hero Image */}
				<div className="-m-4 mb-0 max-h-52 overflow-hidden">
					<img
						src={heroImage.src}
						alt={post.data.title}
						className="object-cover object-center w-full"
					/>
				</div>

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
