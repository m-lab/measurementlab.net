import type { TocEntry } from '@stefanprobst/rehype-extract-toc';

export interface TOCProps {
	entries: TocEntry[];
}

function TocEntryComponent({ entry }: { entry: TocEntry }) {
	const indent = (entry.depth - 1) * 16; // 16px per depth level

	return (
		<>
			{entry.id ? (
				<a
					href={`#${entry.id}`}
					className="block py-1 hover:text-primary-600 transition-colors"
					style={{ paddingLeft: `${indent}px` }}
				>
					{entry.value}
				</a>
			) : (
				<span className="block py-1" style={{ paddingLeft: `${indent}px` }}>
					{entry.value}
				</span>
			)}
			{entry.children &&
				entry.children.map((child, index) => (
					<TocEntryComponent key={index} entry={child} />
				))}
		</>
	);
}

export default function TOC({ entries }: TOCProps) {
	return (
		<aside className="lg:sticky lg:top-25 lg:self-start">
			<nav className="text-sm">
				<h2 className="font-bold text-lg mb-4">Table of Contents</h2>
				<div className="space-y-1">
					{entries.map((entry, index) => (
						<TocEntryComponent key={index} entry={entry} />
					))}
				</div>
			</nav>
		</aside>
	);
}
