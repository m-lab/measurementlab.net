import type { TocEntry } from '@stefanprobst/rehype-extract-toc';

const NAVBAR_HEIGHT = 96; // Height of the fixed navbar in pixels

export interface TOCProps {
  entries: TocEntry[];
}

function TocEntryComponent({ entry }: { entry: TocEntry }) {
  const indent = (entry.depth - 1) * 16; // 16px per depth level

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (entry.id) {
      e.preventDefault();
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
        <a
          href={`#${entry.id}`}
          onClick={handleClick}
          className="block py-1 transition-colors hover:text-primary-600"
          style={{ paddingLeft: `${indent}px` }}
        >
          {entry.value}
        </a>
      ) : (
        <span className="block py-1" style={{ paddingLeft: `${indent}px` }}>
          {entry.value}
        </span>
      )}
      {entry.children?.map((child) => (
        <TocEntryComponent key={entry.id} entry={child} />
      ))}
    </>
  );
}

export default function TOC({ entries }: TOCProps) {
  return (
    <aside className="md:sticky md:top-25 md:self-start">
      <nav className="text-sm">
        <h2 className="mb-4 text-lg font-bold">Table of Contents</h2>
        <div className="space-y-1">
          {entries.map((entry) => (
            <TocEntryComponent key={entry.id} entry={entry} />
          ))}
        </div>
      </nav>
    </aside>
  );
}
