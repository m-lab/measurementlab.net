import Link from '@components/atoms/Link';
import ChevronDownIcon from '~icons/heroicons/chevron-down-20-solid';
import { useRef, useState } from 'react';

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
  const [isOpen, setIsOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setIsOpen(true);
  };

  const close = () => {
    closeTimer.current = setTimeout(() => setIsOpen(false), 80);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setIsOpen(false);
    if (e.key === 'Enter' || e.key === ' ') setIsOpen((v) => !v);
  };

  return (
    <div
      className={`relative inline-block text-left ${className}`}
      onMouseEnter={open}
      onMouseLeave={close}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onKeyDown={handleKeyDown}
        className="transition-300 hover:decoration-gray-100 inline-flex cursor-pointer items-center gap-1 px-3 py-2 text-xl no-underline underline-offset-20 transition hover:underline focus:outline-none"
      >
        {label}
        <ChevronDownIcon
          class={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          aria-hidden="true"
        />
      </button>

      <div
        role="menu"
        className={`ring-opacity-5 absolute top-12 left-0 z-50 mt-2 w-56 origin-top-left bg-white shadow-lg ring-1 ring-black transition-all duration-200 focus:outline-none ${
          isOpen
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-1 opacity-0'
        }`}
      >
        <div className="py-1">
          {items.map(({ href, label, type }) => (
            <Link
              key={href}
              href={href}
              role="menuitem"
              variant="nav"
              external={type === 'external'}
              className="block px-4 py-2 text-neutral-900 no-underline transition-colors hover:bg-primary-100 focus:bg-primary-100 focus:outline-none"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
