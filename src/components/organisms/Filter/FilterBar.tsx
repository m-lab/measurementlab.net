import { useState } from 'react';
import { Input } from '@headlessui/react';
import MagnifyingGlassIcon from '~icons/heroicons/magnifying-glass-20-solid';
import XMarkIcon from '~icons/heroicons/x-mark-20-solid';
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
	const [isSearchExpanded, setIsSearchExpanded] = useState(false);

	const handleSearchChange = (value: string) => {
		setSearchText(value);
	};

	return (
		<div className="px-6 py-8 bg-neutral-900">
			<div className="flex flex-col md:flex-row gap-4 md:gap-10 w-full items-stretch md:items-center max-w-7xl mx-auto">
				{/* Filter Dropdowns */}
				{fields.map((field) => (
					<div key={field} className='flex-1 md:flex-2'>
						<FilterDropdown
							label={field}
							options={fieldOptions[field] || []}
							value={fieldFilters[field]}
							onChange={(value) => onFieldFilterChange(field, value)}
						/>
					</div>
				))}
				{/* Sort Dropdown */}
				<div className='flex-1 md:flex-2 space-between flex gap-4 items-center'>
					<span className="uppercase font-bold text-lg text-neutral-50">Sort:</span>
					<FilterDropdown
						label="Sort"
						options={['newest', 'oldest', 'alphabetical']}
						value={sortBy}
						onChange={(value) => setSortBy(value as 'newest' | 'oldest' | 'alphabetical')}
						showAllOption={false}
					/>
				</div>

				{/* Search Input */}
				<div className="relative flex items-center justify-end flex-1">
					<div className="relative flex items-center justify-end">
						{/* Input field */}
						<div className="relative flex items-center">
							<Input
								type="text"
								value={searchText}
								onChange={(e) => handleSearchChange(e.target.value)}
								placeholder="Search"
								className={`border-y-4 border-t-transparent border-b-neutral-300 bg-neutral-200 px-3 py-2 pl-10 pr-12 text-neutral-700 placeholder-neutral-700 focus:outline-none focus:border-b-primary-600 transition-all duration-300 ease-in-out origin-right ${
									isSearchExpanded 
										? 'opacity-100' 
										: 'w-0 p-0 opacity-0 pointer-events-none'
								}`}
								style={{
									transformOrigin: 'right center'
								}}
								autoFocus={isSearchExpanded}
							/>
							{isSearchExpanded && (
								<MagnifyingGlassIcon 
									className="absolute left-3 h-5 w-5 text-neutral-700 pointer-events-none" 
									aria-hidden="true" 
								/>
							)}
						</div>
						<button
							onClick={() => setIsSearchExpanded(!isSearchExpanded)}
							className={`button-primary flex items-center justify-center w-12 h-12 transition-opacity duration-300 cursor-pointer ${isSearchExpanded ? 'bg-color-transparent' : ''}`}
							aria-label="Expand search"
						>
							{isSearchExpanded
								? (<XMarkIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />)
								: (<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />)
							}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
