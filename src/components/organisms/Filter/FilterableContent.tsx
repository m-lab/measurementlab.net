import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import FilterBar from './FilterBar';

interface FilterableContentProps {
  type: "blog" | "publications";
	items: any[];
	fields: string[];
  placeholder?: string;
}

export default function FilterableContent({ items, fields, placeholder, children }: FilterableContentProps) {
	const [searchText, setSearchText] = useState('');
	const [fieldFilters, setFieldFilters] = useState<Record<string, string>>(
		fields.reduce((acc, field) => ({ ...acc, [field]: 'all' }), {})
	);

	// Get unique values for each field from items
	const fieldOptions = useMemo(() => {
		const options: Record<string, string[]> = {};
		
		fields.forEach(field => {
			const values = new Set<string>();
			items.forEach(item => {
				const value = item.data?.[field] || item[field];
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
			keys: ["data.title"],
			threshold: 0.4, // 0.0 = exact match, 1.0 = match anything
			includeScore: true,
			ignoreLocation: true,
		});
	}, [items]);

	// Filter items using Fuse.js for fuzzy search and field filters
	const filteredItems = useMemo(() => {
		let results = items;

		// Apply text search first
		if (searchText) {
			const fuseResults = fuse.search(searchText);
			results = fuseResults.map(result => result.item);
		}

		// Apply field filters
		results = results.filter(item => {
			return fields.every(field => {
				const filterValue = fieldFilters[field];
				if (filterValue === 'all') return true;

				const itemValue = item.data?.[field] || item[field];
				if (Array.isArray(itemValue)) {
					return itemValue.includes(filterValue);
				}
				return String(itemValue) === filterValue;
			});
		});

		return results;
	}, [searchText, fieldFilters, fuse, items, fields]);

  console.log('Filtered Items:', filteredItems);
  

	return (
		<div>
			<FilterBar 
				searchText={searchText} 
				setSearchText={setSearchText} 
				fields={fields}
				fieldFilters={fieldFilters}
				fieldOptions={fieldOptions}
				onFieldFilterChange={handleFieldFilterChange}
			/>
      {filteredItems.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-600 text-lg">
            {placeholder || 'No items match your search.'}
          </p>
        </div>
      )}
		</div>
	);
}
