import { Input } from '@headlessui/react';
import { useState } from 'react';
import MagnifyingGlassIcon from '~icons/heroicons/magnifying-glass-20-solid';
import XMarkIcon from '~icons/heroicons/x-mark-20-solid';
import type { SortOption } from './FilterableContent';
import { SORT_OPTIONS } from './FilterableContent';
import FilterDropdown from './FilterDropdown';

interface FilterBarProps {
  searchText: string;
  setSearchText: (value: string) => void;
  sortBy: SortOption;
  setSortBy: (value: SortOption) => void;
  fields: string[];
  fieldFilters: Record<string, string[]>;
  fieldOptions: Record<string, string[]>;
  onFieldFilterChange: (field: string, value: string | string[]) => void;
}

const FilterBar = ({
  searchText,
  setSearchText,
  sortBy,
  setSortBy,
  fields,
  fieldFilters,
  fieldOptions,
  onFieldFilterChange,
}: FilterBarProps) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchText(value);
  };

  return (
    <div className="bg-neutral-900 px-6 py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-stretch gap-4 md:flex-row md:items-center md:gap-10">
        {/* Filter Dropdowns */}
        {fields.map((field) => (
          <div key={field} className="flex-1 md:flex-2">
            <FilterDropdown
              label={field}
              options={fieldOptions[field] || []}
              value={fieldFilters[field]}
              onChange={(value) => onFieldFilterChange(field, value)}
              multiple={true}
            />
          </div>
        ))}
        {/* Sort Dropdown */}
        <div className="space-between flex flex-1 items-center gap-4 md:flex-2">
          <span className="text-lg font-bold text-neutral-50 uppercase">
            Sort:
          </span>
          <FilterDropdown
            label="Sort"
            options={[...SORT_OPTIONS]}
            value={sortBy}
            onChange={(value) => setSortBy(value as SortOption)}
            showAllOption={false}
            multiple={false}
          />
        </div>
        {/* Search Input */}
        <div className="ml-auto flex items-center space-x-2">
          <div
            className={`relative flex items-center overflow-hidden transition-all duration-300 ease-in-out ${
              isSearchExpanded ? 'w-64' : 'w-0'
            }`}
          >
            <Input
              type="text"
              aria-label="Search area"
              value={searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search"
              className={`w-full border-y-4 border-t-transparent border-b-neutral-300 bg-neutral-200 px-3 py-2 pr-12 pl-10 text-neutral-700 placeholder-neutral-700 transition-opacity duration-300 ease-in-out focus:border-b-primary-600 focus:outline-none ${
                isSearchExpanded
                  ? 'opacity-100'
                  : 'pointer-events-none opacity-0'
              }`}
              style={{
                transformOrigin: 'right center',
              }}
              autoFocus={isSearchExpanded}
            />
            {isSearchExpanded && (
              <MagnifyingGlassIcon
                class="pointer-events-none absolute left-3 h-5 w-5 text-neutral-700"
                aria-hidden="true"
              />
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            className={`button-primary flex h-12 w-12 cursor-pointer items-center justify-center transition-opacity duration-300 ${isSearchExpanded ? 'bg-color-transparent' : ''}`}
            aria-label="Expand search"
          >
            {isSearchExpanded ? (
              <XMarkIcon class="text-gray-400 h-5 w-5" aria-hidden="true" />
            ) : (
              <MagnifyingGlassIcon
                class="text-gray-400 h-5 w-5"
                aria-hidden="true"
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
