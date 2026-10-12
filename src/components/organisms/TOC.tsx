import Link from '@components/atoms/Link';
import type { TocEntry } from '@stefanprobst/rehype-extract-toc';
import { useEffect, useRef, useState } from 'react';

const NAVBAR_HEIGHT = 96; // Height of the fixed navbar in pixels
// A heading counts as "current" once its top passes this line, measured from
// the top of the viewport. Slightly below the navbar so a heading scrolled to
// by a TOC click (which lands exactly at NAVBAR_HEIGHT) registers as active.
const READING_LINE = NAVBAR_HEIGHT + 8;
const MAX_DEPTH = 2;

export interface TOCProps {
  entries: TocEntry[];
  id: string;
}

function TocEntryComponent({
  entry,
  activeId,
  onNavigate,
}: {
  entry: TocEntry;
  activeId: string | null;
  onNavigate: (id: string) => void;
}) {
  const indent = 4 + (entry.depth - 1) * 10; // 10px per depth level, default of 4px
  const isActive = entry.id !== undefined && entry.id === activeId;

  return (
    <>
      {entry.id ? (
        <Link
          variant="toc"
          id={`toc-anchor-${entry.id}`}
          href={`#${entry.id}`}
          aria-current={isActive ? 'location' : undefined}
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            if (entry.id) onNavigate(entry.id);
          }}
          className={`block border-l-2 py-1 transition-colors ${
            isActive
              ? 'border-primary-600 bg-primary-50 font-medium text-primary-800'
              : 'border-transparent hover:text-primary-600'
          }`}
          style={{ paddingLeft: `${indent}px` }}
        >
          {entry.value}
        </Link>
      ) : (
        <span className="block py-1" style={{ paddingLeft: `${indent}px` }}>
          {entry.value}
        </span>
      )}
      {entry.depth < MAX_DEPTH &&
        entry.children?.map((child) => (
          <TocEntryComponent
            key={`toc-${child.id}`}
            entry={child}
            activeId={activeId}
            onNavigate={onNavigate}
          />
        ))}
    </>
  );
}

// Recursively collect the IDs of every entry the TOC renders, in document order
function collectEntryIds(entries: TocEntry[], maxDepth = MAX_DEPTH): string[] {
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const asideRef = useRef<HTMLElement | null>(null);

  // Track the current section from scroll position: the active heading is the
  // last one whose top has passed the reading line. Unlike an
  // IntersectionObserver band this works in both scroll directions, inside
  // sections taller than the viewport, and at the very top of the page.
  useEffect(() => {
    const headings = collectEntryIds(entries)
      .map((headingId) => document.getElementById(headingId))
      .filter((el): el is HTMLElement => el !== null);

    if (headings.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      let current = headings[0];
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= READING_LINE) {
          current = heading;
        } else {
          break;
        }
      }
      setActiveId(current.id);
    };
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [entries]);

  // Keep the active link visible inside the TOC's own scroll area. Scroll the
  // aside directly rather than calling scrollIntoView, which would also move
  // the page.
  useEffect(() => {
    const aside = asideRef.current;
    if (!aside || !activeId) return;
    const link = document.getElementById(`toc-anchor-${activeId}`);
    if (!link) return;
    const asideRect = aside.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    // Leave a little context above/below the link; the browser clamps to 0.
    const slack = 40;
    if (linkRect.top < asideRect.top + slack) {
      aside.scrollTop += linkRect.top - asideRect.top - slack;
    } else if (linkRect.bottom > asideRect.bottom - slack) {
      aside.scrollTop += linkRect.bottom - asideRect.bottom + slack;
    }
  }, [activeId]);

  const navigate = (headingId: string) => {
    const element = document.getElementById(headingId);
    if (!element) return;
    const offsetPosition =
      element.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  };

  return (
    <aside
      id={id}
      ref={asideRef}
      className="md:sticky md:top-25 md:max-h-[calc(100vh-6.25rem-1rem)] md:self-start md:overflow-y-auto md:overscroll-contain md:[scrollbar-width:thin]"
    >
      <nav className="text-[12px]">
        <h2 className="mb-2 border-b border-neutral-200 text-lg font-bold">
          Table of Contents
        </h2>
        <div className="space-y-1">
          {entries.map((entry) => (
            <TocEntryComponent
              key={`toc-${entry.id}`}
              entry={entry}
              activeId={activeId}
              onNavigate={navigate}
            />
          ))}
        </div>
      </nav>
    </aside>
  );
}
