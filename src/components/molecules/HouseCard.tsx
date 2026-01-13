import type { ReactNode } from 'react';

export interface HouseCardProps {
	image?: ReactNode | string;
	imageAlt?: string;
	title?: string;
	description?: string;
	truncateDescription?: boolean;
	href?: string;
	variant?: 'primary' | 'secondary' | 'supporting1' | 'supporting2' | 'speed' | 'neutral';
	cardType?: 'blog' | 'publication' | 'container';
	className?: string;
	width?: 'standard' | 'narrow';
	aboveTitle?: ReactNode;
	children?: ReactNode;
}

const variantColors = {
	primary: 'bg-white',
	secondary: 'bg-secondary-50 hover:bg-secondary-100',
	supporting1: 'bg-supporting1-50 hover:bg-supporting1-100',
	supporting2: 'bg-supporting2-50 hover:bg-supporting2-100',
	speed: 'bg-speed-50 hover:bg-speed-100',
	neutral: 'bg-neutral-100',
};

const houseWidthStyles = {
	standard: '',
	narrow: 'px-24',
};

export default function HouseCard({
	image,
	imageAlt = '',
	title,
	description,
	truncateDescription = false,
	href,
	variant = 'primary',
	cardType = 'blog',
	className = '',
	width = 'standard',
	aboveTitle,
	children,
}: HouseCardProps) {
	const Tag = cardType === 'blog' ? 'a' : 'div';

	const cardStyle = {
		maskImage: 'conic-gradient(from 45deg at 50px 50px, #000 75%, #0000 0)',
		maskPosition: '-50px',
	};

	return (
		<Tag
			href={href}
			className={`block transition-all border-neutral-200 text-neutral-600 border-b-4 no-underline duration-200 ${className}`}
		>
			<div

				style={cardStyle}
				className={`flex h-full flex-col gap-6 ${variantColors[variant]} ${houseWidthStyles[width]} p-4 ${!image && 'pt-18'}`}
			>
				{image && (
					<div className="-m-4 mb-0 max-h-52 overflow-hidden">
						{typeof image === 'string' ? (
							<img
								src={image}
								alt={imageAlt}
								className="object-cover object-center w-full h-full"
							/>
						) : (
							image
						)}
					</div>
				)}

				{aboveTitle}

				{title &&
					(cardType !== 'blog' && href ? (
						<a href={href}>
							<h3 className="text-xl font-bold md:text-2xl">{title}</h3>
						</a>
					) : (
						<h3 className="text-xl font-bold text-neutral-900 md:text-2xl">
							{title}
						</h3>
					))}

				{description && (
					<div
						className={`grow justify-self-start ${truncateDescription ? 'line-clamp-4' : ''}`}
						dangerouslySetInnerHTML={{ __html: description }}
					/>
				)}

				{children}
			</div>
		</Tag>
	);
}
