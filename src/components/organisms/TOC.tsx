import Link from '@components/atoms/Link';
import type { TocEntry } from '@stefanprobst/rehype-extract-toc';

const NAVBAR_HEIGHT = 96; // Height of the fixed navbar in pixels

export interface TOCProps {
  entries: TocEntry[];
  id: string;
}

const activeTocStyles = ['bg-primary-100'];
let currentActiveToc: HTMLAnchorElement;

function TocEntryComponent({ entry }: { entry: TocEntry }) {
  const indent = 4 + (entry.depth - 1) * 10; // 10px per depth level, default of 4px

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (entry.id) {
      e.preventDefault();
      console.log(e.currentTarget);
      currentActiveToc?.classList.remove(...activeTocStyles);
      currentActiveToc = e.currentTarget;
      e.currentTarget.classList.add(...activeTocStyles);
      const element = document.getElementById(entry.id);
      if (element) {
        const navbarHeight = NAVBAR_HEIGHT;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - navbarHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }
  };

  return (
    <>
      {entry.id ? (
        <Link
          variant="toc"
          id={`toc-anchor-${entry.id}`}
          href={`#${entry.id}`}
          onClick={handleClick}
          className="block py-1 pl-4 transition-colors hover:text-primary-600"
          style={{ paddingLeft: `${indent}px` }}
        >
          {entry.value}
        </Link>
      ) : (
        <span className="block py-1" style={{ paddingLeft: `${indent}px` }}>
          {entry.value}
        </span>
      )}
      {entry.depth < 2 &&
        entry.children?.map((child) => (
          <TocEntryComponent key={entry.id} entry={child} />
        ))}
    </>
  );
}

export default function TOC({ entries, id }: TOCProps) {
  return (
    <aside id={id} className="md:sticky md:top-25 md:self-start">
      <nav className="text-sm">
        <h2 className="mb-2 border-b border-neutral-200 text-lg font-bold">
          Table of Contents
        </h2>
        <div className="space-y-1">
          {entries.map((entry) => (
            <TocEntryComponent key={`${id}-${entry.id}`} entry={entry} />
          ))}
        </div>
      </nav>
    </aside>
  );
}
