import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import ChevronDownIcon from '~icons/heroicons/chevron-down-20-solid';

interface NavItemDropdownProps {
	label: string;
	items: Array<{ href: string; label: string }>;
	class?: string;
}

export default function NavItemDropdown({ label, items, class: className = '' }: NavItemDropdownProps) {
	return (
		<Menu as="div" className={`relative inline-block text-left ${className}`}>
			<MenuButton className="no-underline hover:underline transition transition-300 underline-offset-20 inline-flex items-center gap-1 px-3 py-2 hover:decoration-gray-100">
				{label}
				<ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
			</MenuButton>

			<MenuItems className="absolute left-0 mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
				<div className="py-1">
					{items.map((item) => (
						<MenuItem key={item.href}>
							{({ focus }) => (
								<a
									href={item.href}
									className={`${
										focus ? 'bg-primary-100 text-primary-900' : 'text-gray-900'
									} block px-4 py-2 text-sm transition-colors`}
								>
									{item.label}
								</a>
							)}
						</MenuItem>
					))}
				</div>
			</MenuItems>
		</Menu>
	);
}
