import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import ChevronDownIcon from '~icons/heroicons/chevron-down-20-solid';
import Link from '@components/atoms/Link';

interface NavItemDropdownProps {
	label: string;
	items: Array<{ href: string; label: string }>;
	class?: string;
}

export default function NavItemDropdown({ label, items, class: className = '' }: NavItemDropdownProps) {
	return (
		<Menu as="div" className={`relative inline-block text-left ${className}`}>
			<MenuButton className="text-xl no-underline hover:underline transition transition-300 underline-offset-20 inline-flex items-center gap-1 px-3 py-2 hover:decoration-gray-100 focus:outline-none cursor-pointer">
				{label}
				<ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
			</MenuButton>

			<MenuItems className="absolute left-0 mt-2 w-56 origin-top-left bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
				<div className="py-1">
					{items.map(({ href, label, type}) => (
						<MenuItem key={href}>
							{({ focus }) => (
								<Link
									href={href}
									variant="nav"
									external={type === 'external'}
									className={`${
										focus ? 'bg-primary-100' : ''
									} block px-4 py-2 transition-colors no-underline focus:outline-none text-neutral-900`}
								>
									{label}
								</Link>
							)}
						</MenuItem>
					))}
				</div>
			</MenuItems>
		</Menu>
	);
}
