/**
 * Section background palette — single source of truth.
 *
 * Every consumer derives from this map: the Zod enum in `src/content/config.ts`, the
 * background and text classes in `SectionLayout.astro`, and the `prose-invert` decision
 * in `RichTextSection.astro`. Adding a background here is the only edit needed
 * (plus regenerating the CMS dropdown in `.pages.yml`).
 *
 * `dark: true` means the background is dark enough that content must invert. Set it
 * honestly — it drives text colour, prose inversion, and link contrast.
 */
export const sectionBackgrounds = {
  white: { bg: 'bg-transparent', dark: false },
  gray: { bg: 'bg-neutral-200', dark: false },
  'primary-light': { bg: 'bg-primary-100', dark: false },
  'primary-medium': { bg: 'bg-primary-700', dark: true },
  'primary-dark': { bg: 'bg-primary-900', dark: true },
  'speed-light': { bg: 'bg-speed-100', dark: false },
  'speed-dark': { bg: 'bg-speed-900', dark: true },
} as const;

export type SectionBackground = keyof typeof sectionBackgrounds;

/** Tuple form for `z.enum()`, which needs at least one literal. */
export const sectionBackgroundNames = Object.keys(sectionBackgrounds) as [
  SectionBackground,
  ...SectionBackground[],
];

export const isDarkBackground = (color?: string): boolean =>
  !!color && sectionBackgrounds[color as SectionBackground]?.dark === true;

export const backgroundClass = (color?: string): string =>
  (color && sectionBackgrounds[color as SectionBackground]?.bg) || '';

/**
 * Text colour for a background. `section-dark` is a hook, not a colour: it lets
 * `components.css` fix link contrast for descendants, which a single text colour on the
 * container cannot do (links set their own colour and would otherwise stay dark-on-dark).
 */
export const textClass = (color?: string): string =>
  isDarkBackground(color) ? 'section-dark text-white' : 'text-neutral-900';

/**
 * Zigzag hero patterns — a separate system from section backgrounds, but with the same
 * duplication risk: the enum was previously written out twice in `config.ts` and a third
 * time as a style map in `ZigZagPattern.astro`. Keep it here instead.
 *
 * `-light` pairs a 100 background with a 500 pattern; `-dark` pairs an 800 background
 * with a 300 pattern.
 */
export const zigzagStyles = {
  'primary-light': 'bg-primary-100 text-primary-500',
  'primary-dark': 'bg-primary-800 text-primary-300',
  'secondary-light': 'bg-secondary-100 text-secondary-500',
  'secondary-dark': 'bg-secondary-400 text-secondary-200',
  'supporting1-light': 'bg-supporting1-100 text-supporting1-300',
  'supporting1-dark': 'bg-supporting1-500 text-supporting1-200',
  'supporting2-light': 'bg-supporting2-100 text-supporting2-400',
  'supporting2-dark': 'bg-supporting2-400 text-supporting2-100',
  'speed-light': 'bg-speed-100 text-speed-500',
  'speed-dark': 'bg-speed-800 text-speed-300',
} as const;

export type ZigzagStyle = keyof typeof zigzagStyles;

export const zigzagNames = Object.keys(zigzagStyles) as [
  ZigzagStyle,
  ...ZigzagStyle[],
];

export const zigzagClass = (style?: string): string =>
  (style && zigzagStyles[style as ZigzagStyle]) || '';
