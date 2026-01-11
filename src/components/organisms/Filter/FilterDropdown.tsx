import {
	Select,
} from '@headlessui/react';

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
	const allOptions = [`All ${label}`, ...options];

	return (
		<Select value={value} onChange={(e) => onChange(e.target.value)} className="bg-white px-4 py-2">
				{allOptions.map((option) => (
					<option
						key={option}
						value={option === 'All' ? 'all' : option}
						className="group relative cursor-pointer select-none py-2 pl-10 pr-4 text-gray-900 hover:bg-gray-50 data-focus:bg-gray-50 data-selected:bg-primary-50 data-selected:font-semibold"
					>
						<span className="block truncate">{option}</span>
					</option>
				))}
		</Select>
	);
}
