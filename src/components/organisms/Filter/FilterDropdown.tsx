import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import CheckIcon from '~icons/heroicons/check-20-solid';
import ChevronDownIcon from '~icons/heroicons/chevron-down-20-solid';

const FIELD_LABELS: Record<string, { singular: string; plural: string }> = {
  category: { singular: 'Category', plural: 'Categories' },
  categories: { singular: 'Category', plural: 'Categories' },
  tags: { singular: 'Tag', plural: 'Tags' },
  year: { singular: 'Year', plural: 'Years' },
};

interface FilterDropdownProps {
  label: string;
  options: string[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  showAllOption?: boolean;
  multiple?: boolean;
}

export default function FilterDropdown(props: FilterDropdownProps) {
  const {
    label,
    options: rawOptions,
    value: rawValue,
    onChange,
    showAllOption = true,
    multiple = false,
  } = props;

  const allLabel = `All ${FIELD_LABELS[label]?.plural || label}`;

  const value = Array.isArray(rawValue) ? rawValue : [rawValue];
  const options = showAllOption ? [allLabel, ...rawOptions] : rawOptions;

  const displayText =
    value.length === 0 || (value.length === 1 && value[0] === allLabel)
      ? allLabel
      : value.length === 1
        ? value[0].charAt(0).toUpperCase() + value[0].slice(1)
        : `${value.length} selected`;

  const handleChange = (newValue: string | string[]) => {
    if (multiple) {
      const valueArray = newValue as string[];
      // If "all" is selected, clear all selections
      if (valueArray.includes(allLabel)) {
        (onChange as (value: string[]) => void)([]);
      } else {
        (onChange as (value: string[]) => void)(valueArray);
      }
    } else {
      // Single select mode
      const singleValue = Array.isArray(newValue) ? newValue[0] : newValue;
      (onChange as (value: string) => void)(singleValue);
    }
  };

  return (
    <Listbox
      value={multiple ? value : value[0]}
      onChange={handleChange}
      multiple={multiple}
    >
      <div className="relative w-full">
        <ListboxButton className="w-full cursor-pointer appearance-none border-y-4 border-t-transparent border-b-neutral-300 bg-neutral-200 px-3 py-2 pr-10 text-left text-neutral-700 focus:border-b-primary-600 focus:outline-none">
          <span className="block truncate">{displayText}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDownIcon
              class="h-5 w-5 text-neutral-500"
              aria-hidden="true"
            />
          </span>
        </ListboxButton>

        <ListboxOptions className="ring-opacity-5 absolute z-10 mt-1 max-h-60 w-full overflow-auto bg-white py-1 text-base shadow-lg ring-1 ring-black focus:outline-none">
          {options.map((option) => (
            <ListboxOption
              key={option}
              value={option}
              className={({ focus }) =>
                `relative cursor-pointer py-2 pr-4 pl-10 select-none ${
                  focus ? 'bg-primary-100 text-primary-900' : 'text-gray-900'
                }`
              }
            >
              {({ selected }) => (
                <>
                  <span
                    className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </span>
                  {!value.length || selected ? (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600">
                      <CheckIcon class="h-5 w-5" aria-hidden="true" />
                    </span>
                  ) : null}
                </>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
