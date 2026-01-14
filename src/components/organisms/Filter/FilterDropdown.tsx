import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import ChevronDownIcon from '~icons/heroicons/chevron-down-20-solid';
import CheckIcon from '~icons/heroicons/check-20-solid';

const FIELD_LABELS: Record<string, {singular: string, plural: string}> = {
  category: {singular: 'Category', plural: 'Categories'},
  tags: {singular: 'Tag', plural: 'Tags'},
  year: {singular: 'Year', plural: 'Years'},
};

interface FilterDropdownProps {
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  showAllOption?: boolean;
}

export default function FilterDropdown({
  label,
  options,
  value,
  onChange,
  showAllOption = true,
}: FilterDropdownProps) {
  const allLabel = `All ${FIELD_LABELS[label]?.plural || label}`;
  const displayText = value.length === 0 || (value.length === 1 && value[0] === 'all')
    ? allLabel
    : value.length === 1
    ? value[0].charAt(0).toUpperCase() + value[0].slice(1)
    : `${value.length} selected`;

  const handleChange = (newValue: string[]) => {
    // If "all" is selected, clear all selections
    if (newValue.includes('all')) {
      onChange([]);
    } else {
      onChange(newValue);
    }
  };

  return (
    <Listbox value={value} onChange={handleChange} multiple>
      <div className="relative w-full">
        <ListboxButton className="w-full appearance-none border-y-4 border-t-transparent border-b-neutral-300 bg-neutral-200 px-3 py-2 pr-10 text-neutral-700 cursor-pointer focus:outline-none focus:border-b-primary-600 text-left">
          <span className="block truncate">{displayText}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDownIcon className="h-5 w-5 text-neutral-500" aria-hidden="true" />
          </span>
        </ListboxButton>
        
        <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {showAllOption && (
            <ListboxOption
              value="all"
              className={({ active }) =>
                `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                  active ? 'bg-primary-100 text-primary-900' : 'text-gray-900'
                }`
              }
            >
              {({ selected }) => (
                <>
                  <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                    {allLabel}
                  </span>
                  {value.length === 0 && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600">
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}
                </>
              )}
            </ListboxOption>
          )}
          {options.map((option) => (
            <ListboxOption
              key={option}
              value={option}
              className={({ active }) =>
                `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                  active ? 'bg-primary-100 text-primary-900' : 'text-gray-900'
                }`
              }
            >
              {({ selected }) => (
                <>
                  <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </span>
                  {selected && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600">
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}
                </>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
