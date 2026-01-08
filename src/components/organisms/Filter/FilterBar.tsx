import { useState } from 'react';
import MagnifyingGlassIcon from '~icons/heroicons/magnifying-glass-20-solid';
import FilterDropdown from './FilterDropdown';

interface FilterBarProps {
	searchText: string;
	setSearchText: (value: string) => void;
	fields: string[];
	fieldFilters: Record<string, string>;
	fieldOptions: Record<string, string[]>;
	onFieldFilterChange: (field: string, value: string) => void;
}

export default function FilterBar({ 
	searchText, 
	setSearchText, 
	fields,
	fieldFilters,
	fieldOptions,
	onFieldFilterChange
}: FilterBarProps) {
	const handleSearchChange = (value: string) => {
		setSearchText(value);
	};

	return (
		<div className="w-full max-w-4xl mx-auto m-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
			
				{/* Filter Dropdowns */}
				<div className="flex flex-wrap gap-3">
					{fields.map((field) => (
						<FilterDropdown
							key={field}
							label={field}
							options={fieldOptions[field] || []}
							value={fieldFilters[field]}
							onChange={(value) => onFieldFilterChange(field, value)}
						/>
					))}
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
