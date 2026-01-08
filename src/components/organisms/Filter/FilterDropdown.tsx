import {
	Listbox,
	ListboxButton,
	ListboxOption,
	ListboxOptions,
} from '@headlessui/react';
import ChevronDownIcon from '~icons/heroicons/chevron-down-20-solid';
import CheckIcon from '~icons/heroicons/check-20-solid';

interface FilterDropdownProps {
	label: string;
	options: string[];
	value: string;
	onChange: (value: string) => void;
}

export default function FilterDropdown({
	label,
	options,
	value,
	onChange,
}: FilterDropdownProps) {
	const allOptions = ['All', ...options];
	const displayValue = value === 'all' ? 'All' : value;

	return (
		<Listbox value={value} onChange={onChange}>
			<div className="relative">
				<ListboxButton className="relative w-full cursor-pointer rounded-md bg-white py-2.5 pl-3 pr-10 text-left text-sm text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-600 data-open:ring-2 data-open:ring-primary-600">
					<span className="block truncate">{displayValue}</span>
					<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
						<ChevronDownIcon
							className="h-5 w-5 text-gray-400 transition-transform group-data-open:rotate-180"
							aria-hidden="true"
						/>
					</span>
				</ListboxButton>

				<ListboxOptions
					anchor="bottom start"
					className="z-10 mt-1 max-h-60 w-[var(--button-width)] overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none [--anchor-gap:0.5rem]"
				>
					{allOptions.map((option) => (
						<ListboxOption
							key={option}
							value={option === 'All' ? 'all' : option}
							className="group relative cursor-pointer select-none py-2 pl-10 pr-4 text-gray-900 hover:bg-gray-50 data-focus:bg-gray-50 data-selected:bg-primary-50 data-selected:font-semibold"
						>
							<span className="block truncate">{option}</span>
							<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600 group-data-selected:block group-data-[selected=false]:hidden">
								<CheckIcon className="h-5 w-5" aria-hidden="true" />
							</span>
						</ListboxOption>
					))}
				</ListboxOptions>
			</div>
		</Listbox>
	);
}
