import { Disclosure } from '@headlessui/react';
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
  className = ''
}: Props) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  return (
    <div className={`grid gap-4 ${gridCols[columns]} ${className}`}>
      {items.map((item, index) => (
        <Disclosure
          key={index}
          as="div"
          className={
            variant === 'bordered'
              ? 'border-2 border-neutral-200 rounded-lg transition-colors hover:border-primary-300'
              : ''
          }
        >
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center p-4 text-left hover:bg-neutral-50 transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2">
                <span className="font-semibold text-neutral-900 text-base md:text-lg">
                  {item.title}
                </span>
                <ChevronDownIcon
                  className={`w-5 h-5 text-neutral-500 transition-transform duration-200 ${
                    open ? 'rotate-180' : ''
                  }`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="p-4 pt-0 text-neutral-700 prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: item.content }} />
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      ))}
    </div>
  );
}
