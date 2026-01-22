import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';

/**
 * Rehype plugin to convert deprecated `align` attributes on table cells
 * to CSS `text-align` styles for WCAG accessibility compliance.
 *
 * The GFM markdown table alignment syntax (e.g., `:---` for left, `---:` for right)
 * causes parsers to add deprecated HTML `align` attributes. This plugin removes
 * them and applies equivalent CSS styles instead.
 */
export function rehypeTableAlign() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (
        (node.tagName === 'th' || node.tagName === 'td') &&
        node.properties?.align
      ) {
        const align = node.properties.align as string;

        // Remove the deprecated align attribute
        delete node.properties.align;

        // Add text-align as inline style
        const existingStyle = (node.properties.style as string) || '';
        const newStyle = existingStyle
          ? `${existingStyle}; text-align: ${align}`
          : `text-align: ${align}`;
        node.properties.style = newStyle;
      }
    });
  };
}

export default rehypeTableAlign;
