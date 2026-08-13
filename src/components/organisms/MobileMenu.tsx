import Link from '@components/atoms/Link';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { siteConfig } from '@lib/config';
import type { NavItem } from '@utils/navigation';
import { useState } from 'react';
import IconOpenMenu from '~icons/heroicons/bars-3';
import IconCloseMenu from '~icons/heroicons/x-mark';

interface MobileMenuProps {
  items: NavItem[];
  currentPath?: string;
}

const MobileMenuItem = ({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: boolean;
}) => {
  return (
    <li key={item.href}>
      <Link
        href={item.href}
        external={item.type === 'external'}
        variant="nav"
        className={`group text-black no-underline decoration-neutral-400 underline-offset-8 transition hover:underline ${
          isActive ? 'underline decoration-black' : 'no-underline'
        }`}
      >
        {item.label}
      </Link>
    </li>
  );
};

export default function MobileMenu({
  items,
  currentPath = '/',
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return currentPath === '/';
    return currentPath.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="button-base button-size-lg button-outline inline-flex cursor-pointer items-center justify-center"
        aria-label="Open menu"
      >
        <IconOpenMenu />
      </button>

      {/* Mobile menu dialog */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50 md:hidden"
      >
        <DialogBackdrop
          transition
          className="bg-neutral-900/80 fixed inset-0 transition-opacity duration-300 ease-linear data-closed:opacity-0"
        />

        <div className="fixed inset-0 flex">
          <DialogPanel
            transition
            className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
          >
            <div className="absolute top-0 right-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="-m-2.5 p-2.5"
                aria-label="Close menu"
              >
                <IconCloseMenu />
              </button>
            </div>

            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white p-6">
              <a href="/">
                <img
                  src="/logo-short-blue.svg"
                  height={84}
                  width={84}
                  alt={siteConfig.name}
                />
              </a>
              <nav className="flex flex-1 flex-col">
                <ul className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul className="space-y-4">
                      {items.map((item) => (
                        <>
                          <MobileMenuItem
                            item={item}
                            isActive={isActive(item.href)}
                          />
                          {item.children && item.children.length > 0 && (
                            <ul className="mt-2 ml-6 space-y-4">
                              {item.children.map((child) => (
                                <MobileMenuItem
                                  key={child.href}
                                  item={child}
                                  isActive={isActive(child.href)}
                                />
                              ))}
                            </ul>
                          )}
                        </>
                      ))}
                    </ul>
                  </li>
                </ul>
              </nav>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
