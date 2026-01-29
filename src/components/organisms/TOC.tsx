import Link from '@components/atoms/Link';
import type { TocEntry } from '@stefanprobst/rehype-extract-toc';
import { useEffect, useRef } from 'react';

const NAVBAR_HEIGHT = 96; // Height of the fixed navbar in pixels

export interface TOCProps {
  entries: TocEntry[];
  id: string;
}

const activeTocStyles = ['bg-primary-100'];

function TocEntryComponent({
  entry,
  currentActiveRef,
}: {
  entry: TocEntry;
  currentActiveRef: React.RefObject<HTMLAnchorElement | null>;
}) {
  const indent = 4 + (entry.depth - 1) * 10; // 10px per depth level, default of 4px

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (entry.id) {
      e.preventDefault();
      currentActiveRef.current?.classList.remove(...activeTocStyles);
      currentActiveRef.current = e.currentTarget;
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
          <TocEntryComponent
            key={`toc-${child.id}`}
            entry={child}
            currentActiveRef={currentActiveRef}
          />
        ))}
    </>
  );
}

// Recursively collect all entry IDs from the TOC tree
function collectEntryIds(entries: TocEntry[], maxDepth = 2): string[] {
  const ids: string[] = [];
  for (const entry of entries) {
    if (entry.id) {
      ids.push(entry.id);
    }
    if (entry.depth < maxDepth && entry.children) {
      ids.push(...collectEntryIds(entry.children, maxDepth));
    }
  }
  return ids;
}

export default function TOC({ entries, id }: TOCProps) {
  const currentActiveRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const entryIds = collectEntryIds(entries);
    const headingElements = entryIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (headingElements.length === 0) return;

    const observer = new IntersectionObserver(
      (observerEntries) => {
        // Find the first heading that is intersecting
        const intersecting = observerEntries.find((e) => e.isIntersecting);
        if (intersecting) {
          const headingId = intersecting.target.id;
          const tocLink = document.getElementById(
            `toc-anchor-${headingId}`
          ) as HTMLAnchorElement | null;

          if (tocLink && tocLink !== currentActiveRef.current) {
            currentActiveRef.current?.classList.remove(...activeTocStyles);
            tocLink.classList.add(...activeTocStyles);
            currentActiveRef.current = tocLink;
          }
        }
      },
      {
        rootMargin: `-${NAVBAR_HEIGHT}px 0px -70% 0px`,
        threshold: 0,
      }
    );

    for (const el of headingElements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [entries]);

  return (
    <aside id={id} className="md:sticky md:top-25 md:self-start">
      <nav className="text-[12px]">
        <h2 className="mb-2 border-b border-neutral-200 text-lg font-bold">
          Table of Contents
        </h2>
        <div className="space-y-1">
          {entries.map((entry) => (
            <TocEntryComponent
              key={`toc-${entry.id}`}
              entry={entry}
              currentActiveRef={currentActiveRef}
            />
          ))}
        </div>
      </nav>
    </aside>
  );
}
