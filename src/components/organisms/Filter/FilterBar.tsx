import { useState } from 'react';
import MagnifyingGlassIcon from '~icons/heroicons/magnifying-glass-20-solid';
import FilterDropdown from './FilterDropdown';

interface FilterBarProps {
	searchText: string;
	setSearchText: (value: string) => void;
	sortBy: 'newest' | 'oldest' | 'alphabetical';
	setSortBy: (value: 'newest' | 'oldest' | 'alphabetical') => void;
	fields: string[];
	fieldFilters: Record<string, string>;
	fieldOptions: Record<string, string[]>;
	onFieldFilterChange: (field: string, value: string) => void;
}

export default function FilterBar({ 
	searchText, 
	setSearchText,
	sortBy,
	setSortBy,
	fields,
	fieldFilters,
	fieldOptions,
	onFieldFilterChange
}: FilterBarProps) {
	const handleSearchChange = (value: string) => {
		setSearchText(value);
	};

	return (
		<div className="p-6 bg-neutral-900">
			
			<div className="flex flex-row gap-4 w-full items-center max-w-7xl mx-auto">
			
				

				{/* Filter Dropdowns */}
				{fields.map((field) => (
					<div key={field} className='flex-1'>
						<FilterDropdown
							label={field}
							options={fieldOptions[field] || []}
							value={fieldFilters[field]}
							onChange={(value) => onFieldFilterChange(field, value)}
						/>
					</div>
				))}

				{/* Sort Dropdown */}
				<div className='flex-1'>
					<FilterDropdown
						label="Sort"
						options={['newest', 'oldest', 'alphabetical']}
						value={sortBy}
						onChange={(value) => setSortBy(value as 'newest' | 'oldest' | 'alphabetical')}
					/>
				</div>

				{/* Search Input */}
				<div className="relative flex-1">
					<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<MagnifyingGlassIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
					</div>
					<input
						type="text"
						value={searchText}
						onChange={(e) => handleSearchChange(e.target.value)}
						placeholder="Search posts..."
						className="block w-full rounded-md border-0 bg-white py-2.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
					/>
				</div>
			</div>
		</div>
	);
}
