import Tag from '@components/atoms/Tag';
import type { KbCardData } from '@utils/kb';
import type { CSSProperties } from 'react';

/**
 * Knowledge base card, in the same style as PublicationItem: a neutral panel
 * with the shared `notch` corner cut and a heavy bottom rule.
 */

/**
 * Overrides the `notch` utility's 50px default (src/styles/utilities.css).
 * Scaled down because these sit three to a row, where the publications card is
 * full-width at max-w-4xl. The `p-8` below has to clear the notch or the first
 * tag lands inside the cut, so the two move together.
 */
const NOTCH_PX = 28;

/** The palette climbs with effort: green → amber → purple. */
const DIFFICULTY_VARIANT = {
  beginner: 'supporting1',
  intermediate: 'secondary',
  advanced: 'speed',
} as const;

/** Frontmatter stores the level lowercase; the badge shows it capitalised. */
const DIFFICULTY_LABEL = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
} as const;

interface Props {
  article: KbCardData;
  /** Show a DRAFT badge beside the difficulty. Off in production. */
  markDraft?: boolean;
}

export default function KnowledgeBaseCard({ article, markDraft }: Props) {
  const isDraft = markDraft && article.status === 'draft';
  const hasTopRow = Boolean(article.difficulty) || isDraft;

  return (
    <div
      className="notch group relative flex h-full flex-col border-b-4 border-neutral-200 transition-colors duration-200 hover:border-primary-400"
      style={{ '--notch': `${NOTCH_PX}px` } as CSSProperties}
    >
      <div className="flex h-full flex-col gap-4 bg-neutral-100 p-8">
        {hasTopRow && (
          <div className="flex flex-wrap items-center gap-2">
            {article.difficulty && (
              <Tag variant={DIFFICULTY_VARIANT[article.difficulty]}>
                {DIFFICULTY_LABEL[article.difficulty]}
              </Tag>
            )}
            {isDraft && (
              // Outlined rather than a filled Tag: every filled variant is a
              // palette colour that means something here, and `neutral` is the
              // panel's own background. An outline also reads as an annotation
              // on the card rather than as content.
              <span className="inline-flex items-center rounded-md border border-neutral-400 px-2 py-1 text-xs font-bold tracking-wide text-neutral-500 uppercase">
                Draft
              </span>
            )}
          </div>
        )}

        <h3 className="text-lg leading-snug font-bold md:text-xl">
          {/*
            Stretched link: `after:absolute after:inset-0` spreads this anchor's
            hit area over the whole card (which is `relative`), so the card is
            clickable without wrapping it in an anchor. Wrapping would fold the
            description and every tag into the link's accessible name; this way
            the name stays the title alone.
          */}
          <a
            href={`/kb/${article.permalink}`}
            className="text-neutral-900 no-underline transition-colors after:absolute after:inset-0 hover:text-primary-600"
          >
            {article.title}
          </a>
        </h3>

        {article.description && (
          <p className="line-clamp-4 grow text-sm text-neutral-600">
            {article.description}
          </p>
        )}

        {article.tags.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2 border-t border-neutral-300 pt-4">
            {/* `primary`, as on the publications card — `neutral` is the
                panel's own background colour and would vanish. */}
            {article.tags.map((tag) => (
              <Tag key={tag} variant="primary">
                {tag}
              </Tag>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
