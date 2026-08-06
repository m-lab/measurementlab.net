import { siteConfig } from '@lib/config';

/**
 * Check if currently in development mode
 */
export const isDev = import.meta.env.DEV;

/**
 * Check if running in preview mode (e.g. Netlify preview site)
 * Set PUBLIC_PREVIEW=true in the environment to enable
 */
export const isPreview = !!import.meta.env.PUBLIC_PREVIEW;

/**
 * True in local dev only — NOT in preview builds.
 * Use for dev tooling (section labels, debug borders) that shouldn't
 * appear on the preview site.
 */
export const isDevOnly = isDev && !isPreview;

/**
 * Hostnames that count as the live site.
 */
const PRODUCTION_HOSTNAMES = ['measurementlab.net', 'www.measurementlab.net'];

const siteHostname = (() => {
  try {
    return new URL(siteConfig.url).hostname;
  } catch {
    return '';
  }
})();

/**
 * True only on the main site.
 */
export const isProduction =
  !isDev && !isPreview && PRODUCTION_HOSTNAMES.includes(siteHostname);

/**
 * Returns CSS classes only in local dev mode (not preview)
 * @param classes - The classes to apply in dev mode
 * @returns The classes string in dev, empty string otherwise
 *
 * @example
 * <div class={`base-class ${devClass('border-2 border-red-500')}`}>
 */
export function devClass(classes: string): string {
  return isDevOnly ? classes : '';
}

/**
 * Conditionally merges classes, filtering out dev-only classes in production/preview
 * @param baseClasses - Classes that always apply
 * @param devClasses - Classes that only apply in local dev mode
 * @returns Merged class string
 *
 * @example
 * <div class={devClasses('base-class', 'border-2 border-red-500')}>
 */
export function devClasses(baseClasses: string, devClasses: string): string {
  const dev = isDevOnly ? devClasses : '';
  return [baseClasses, dev].filter(Boolean).join(' ');
}
