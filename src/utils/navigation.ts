/**
 * Navigation utilities for handling flexible links
 */

type FlexibleLink = 
  | { type: 'internal'; label: string; pageRef: string; description?: string }
  | { type: 'external'; label: string; externalUrl: string; description?: string };

type NavigationItem =
  | { type: 'single'; link: FlexibleLink }
  | { type: 'dropdown'; label: string; links: FlexibleLink[] };

export interface NavItem {
  href: string;
  label: string;
  children?: Array<{ href: string; label: string }>;
}

/**
 * Resolves a flexible link to an href string
 * @param link - The flexible link object (internal or external)
 * @returns The resolved href path or URL
 */
export const resolveFlexibleLink = (link: FlexibleLink): string => {
  if (link.type === 'internal') {
    // Resolve internal page reference to path
    return `/${link.pageRef}`;
  } else if (link.type === 'external') {
    return link.externalUrl;
  }
  return '/';
};

/**
 * Converts navigation items from content config format to NavItem array
 * @param items - Array of navigation items (single links or dropdown menus)
 * @returns Array of NavItem objects with href, label, and optional children
 */
export const convertNavigationItems = (items: NavigationItem[]): NavItem[] => {
  return items.map(item => {
    if (item.type === 'single') {
      // Single link - flat structure
      return {
        href: resolveFlexibleLink(item.link),
        label: item.link.label,
      };
    } else {
      // Dropdown menu - include children
      return {
        href: '#', // Dropdown doesn't have a direct href
        label: item.label,
        children: item.links.map(link => ({
          href: resolveFlexibleLink(link),
          label: link.label,
        })),
      };
    }
  });
};
