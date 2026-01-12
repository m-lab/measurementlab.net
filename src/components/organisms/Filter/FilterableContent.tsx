import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import FilterBar from './FilterBar';
import BlogItems from '../Blog/BlogItems';
import type { BlogPostCardData } from '@utils/blog';
import type { PublicationCardData } from '@utils/publications';
import PublicationItems from '../Publication/PublicationItems';

const PLACEHOLDER_TYPE_LABEL: Record<FilterableContentType, string> = {
	blog: 'blog posts',
	publications: 'publications',
};

type FilterableContentType = 'blog' | 'publications';
export type FilterableContentItem = BlogPostCardData | PublicationCardData;

interface FilterableContentProps {
  type: FilterableContentType;
	items: FilterableContentItem[];
	fields: string[];
}


export default function FilterableContent({ items, type, fields }: FilterableContentProps) {
	const [searchText, setSearchText] = useState('');
	const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
	const [fieldFilters, setFieldFilters] = useState<Record<string, string>>(
		fields.reduce((acc, field) => ({ ...acc, [field]: 'all' }), {})
	);
	const hasFiltersSet = useMemo(() => {
		return !!searchText || Object.values(fieldFilters).some(value => value !== 'all');
	}, [searchText, fieldFilters]);

	// Get unique values for each field from items
	const fieldOptions = useMemo(() => {
		const options: Record<string, string[]> = {};
		
		fields.forEach(field => {
			const values = new Set<string>();
			items.forEach(item => {
				const value = item.post.data?.[field] || item.post[field];
				if (Array.isArray(value)) {
					value.forEach(v => values.add(String(v)));
				} else if (value) {
					values.add(String(value));
				}
			});
			options[field] = Array.from(values).sort();
		});
		
		return options;
	}, [items, fields]);

	const handleFieldFilterChange = (field: string, value: string) => {
		setFieldFilters(prev => ({ ...prev, [field]: value }));
	};

	// Create Fuse instance with configured fields
	const fuse = useMemo(() => {
		return new Fuse(items, {
			keys: ["post.data.title"],
			threshold: 0.4, // 0.0 = exact match, 1.0 = match anything
			includeScore: true,
			ignoreLocation: true,
		});
	}, [items]);

	const sortFunction = useMemo(() => {		
		const dateKey = type === 'blog' ? 'publishedDate' : 'year';

		if (sortBy === 'alphabetical') {
			return (a: FilterableContentItem, b: FilterableContentItem) => {
				const titleA = a.post.data.title.toLowerCase();
				const titleB = b.post.data.title.toLowerCase();
				return titleA.localeCompare(titleB);
			};
		} else if (sortBy === 'oldest') {
			return (a: FilterableContentItem, b: FilterableContentItem) => {
				return a.post.data[dateKey] - b.post.data[dateKey];
			};
		} else {
			return (a: FilterableContentItem, b: FilterableContentItem) => {
				return b.post.data[dateKey] - a.post.data[dateKey];
			};
		}
	}, [sortBy, type]);

	// Filter items using Fuse.js for fuzzy search and field filters
	const filteredItems = useMemo(() => {
		let results = items;

		// Apply text search first
		if (searchText) {
			const fuseResults = fuse.search(searchText);
			results = fuseResults.map(result => result.item);
		}

		// Apply field filters
		return results
			.filter(item => {
				return fields.every(field => {
					const filterValue = fieldFilters[field];
					if (filterValue === 'all') return true;

					const itemValue = item.post.data?.[field] || item.post[field];
					if (Array.isArray(itemValue)) {
						return itemValue.includes(filterValue);
					}
					return String(itemValue) === filterValue;
				});
			})
			.sort(sortFunction)

	}, [searchText, fieldFilters, fuse, items, fields, sortFunction]);

	return (
		<div>
			<FilterBar 
				searchText={searchText} 
				setSearchText={setSearchText}
				sortBy={sortBy}
				setSortBy={setSortBy}
				fields={fields}
				fieldFilters={fieldFilters}
				fieldOptions={fieldOptions}
				onFieldFilterChange={handleFieldFilterChange}
			/>
			<div className="py-12">
				{type === 'blog'
					? <BlogItems items={filteredItems as BlogPostCardData[]} />
					: <PublicationItems items={filteredItems as PublicationCardData[]} />
				}
			</div>
      {filteredItems.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-600 text-lg">
						{hasFiltersSet 
							? `No ${PLACEHOLDER_TYPE_LABEL[type]} match your search.`
							: `No ${PLACEHOLDER_TYPE_LABEL[type]} published yet. Check back soon!`}
          </p>
        </div>
      )}
		</div>
	);
}
