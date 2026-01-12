import { Select } from '@headlessui/react';
import ChevronDownIcon from '~icons/heroicons/chevron-down-20-solid';

interface FilterDropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  showAllOption?: boolean;
}

export default function FilterDropdown({
  label,
  options,
  value,
  onChange,
  showAllOption = true,
}: FilterDropdownProps) {
  const allLabel = `All ${label}`;
  const allOptions = showAllOption ? [allLabel, ...options] : options;

  return (
    <div className="relative w-full">
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none border-y-4 border-t-transparent border-b-neutral-300 bg-neutral-200 px-3 py-2 pr-10 text-neutral-700 cursor-pointer focus:outline-none focus:border-b-primary-600"
      >
        {allOptions.map((option) => (
          <option
            key={option}
            value={option === allLabel ? 'all' : option}
            className="bg-white text-gray-900 capitalize"
          >
            {option}
          </option>
        ))}
      </Select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <ChevronDownIcon className="h-5 w-5 text-neutral-500" aria-hidden="true" />
      </div>
    </div>
  );
}
