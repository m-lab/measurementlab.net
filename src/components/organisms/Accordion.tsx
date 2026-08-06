import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import ChevronDownIcon from '~icons/heroicons/chevron-down-20-solid';

export interface AccordionItem {
  title: string;
  content: string;
}

export interface Props {
  items: AccordionItem[];
  columns?: 1 | 2 | 3 | 6;
  variant?: 'default' | 'bordered';
  className?: string;
}

export default function Accordion({
  items,
  columns = 1,
  variant = 'default',
  className = '',
}: Props) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };

  return (
    <div className={`grid gap-4 ${gridCols[columns]} ${className}`}>
      {items.map((item, index) => (
        <Disclosure
          key={`${item.title}:${index}`}
          as="div"
          className={
            variant === 'bordered'
              ? 'rounded-lg border-2 border-neutral-200 transition-colors hover:border-primary-300'
              : ''
          }
        >
          {({ open }) => (
            <>
              <DisclosureButton className="flex w-full items-center justify-between rounded-lg p-4 text-left transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2">
                <span className="text-base font-semibold text-neutral-900 md:text-lg">
                  {item.title}
                </span>
                <ChevronDownIcon
                  className={`h-5 w-5 text-neutral-500 transition-transform duration-200 ${
                    open ? 'rotate-180' : ''
                  }`}
                />
              </DisclosureButton>
              <DisclosurePanel className="prose prose-sm max-w-none p-4 pt-0 text-neutral-700">
                <div dangerouslySetInnerHTML={{ __html: item.content }} />
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
      ))}
    </div>
  );
}
