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
	const [isSearchExpanded, setIsSearchExpanded] = useState(false);

	const handleSearchChange = (value: string) => {
		setSearchText(value);
	};

	return (
		<div className="p-6 bg-neutral-900">
			<div className="flex flex-row gap-4 w-full items-center max-w-7xl mx-auto">
				{/* Filter Dropdowns */}
				{fields.map((field) => (
					<div key={field} className='flex-2'>
						<FilterDropdown
							label={field}
							options={fieldOptions[field] || []}
							value={fieldFilters[field]}
							onChange={(value) => onFieldFilterChange(field, value)}
						/>
					</div>
				))}

				{/* Sort Dropdown */}
				<div className='flex-2'>
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
						{/* Animated Icon */}
						<div 
							className={`absolute flex items-center justify-center transition-all duration-300 ease-in-out z-10 ${
								isSearchExpanded 
									? 'left-3 w-5 h-5' 
									: 'right-0 w-10 h-10 bg-white rounded-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
							}`}
							style={{
								pointerEvents: isSearchExpanded ? 'none' : 'auto'
							}}
						>
							<button
								onClick={() => setIsSearchExpanded(true)}
								className={`flex items-center justify-center transition-opacity duration-300 ${
									isSearchExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100 w-10 h-10'
								}`}
								aria-label="Expand search"
							>
								<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
							</button>
							{isSearchExpanded && (
								<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
							)}
						</div>
						
						{/* Input field */}
						<input
							type="text"
							value={searchText}
							onChange={(e) => handleSearchChange(e.target.value)}
							onBlur={() => {
								if (!searchText) {
									setIsSearchExpanded(false);
								}
							}}
							placeholder="Search posts..."
							className={`block rounded-md border-0 bg-white py-2.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-all duration-300 ease-in-out origin-right ${
								isSearchExpanded 
									? 'w-96 pl-10 pr-3 opacity-100' 
									: 'w-0 pl-0 pr-0 opacity-0 pointer-events-none'
							}`}
							style={{
								transformOrigin: 'right center'
							}}
							autoFocus={isSearchExpanded}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
