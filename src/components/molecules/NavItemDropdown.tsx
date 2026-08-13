import Link from '@components/atoms/Link';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import ChevronDownIcon from '~icons/heroicons/chevron-down-20-solid';

interface NavItemDropdownProps {
  label: string;
  items: Array<{ href: string; label: string; type: 'external' | 'internal' }>;
  class?: string;
}

export default function NavItemDropdown({
  label,
  items,
  class: className = '',
}: NavItemDropdownProps) {
  return (
    <Menu as="div" className={`relative inline-block text-left ${className}`}>
      {/* `hover:decoration-gray-100` was dropped rather than renamed — see NavItem.astro. */}
      <MenuButton className="transition-300 inline-flex cursor-pointer items-center gap-1 px-3 py-2 text-xl no-underline underline-offset-20 transition hover:underline focus:outline-none">
        {label}
        <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
      </MenuButton>

      <MenuItems
        transition
        className="ring-opacity-5 absolute top-12 left-0 z-50 mt-2 w-56 origin-top-left bg-white shadow-lg ring-1 ring-black transition-opacity focus:outline-none data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-100 data-leave:ease-in"
      >
        <div className="py-1">
          {items.map(({ href, label, type }) => (
            <MenuItem key={href}>
              {({ focus }) => (
                <Link
                  href={href}
                  variant="nav"
                  external={type === 'external'}
                  className={`${
                    focus ? 'bg-primary-100' : ''
                  } block px-4 py-2 text-neutral-900 no-underline transition-colors focus:outline-none`}
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
