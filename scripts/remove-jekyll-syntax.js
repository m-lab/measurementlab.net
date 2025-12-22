#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, '..', 'src', 'content', 'blog');
const MIGRATION_NOTES_PATH = path.join(__dirname, '..', 'MIGRATION_NOTES.md');

// Tracking data structures
const removals = {
  imageSizing: [], // {file, line, content, dimensions}
  layoutStyling: [], // {file, line, content, classes}
  linkTargets: [], // {file, count}
  other: [] // {file, line, content}
};

// Jekyll syntax patterns
const patterns = {
  // Specific patterns for tracking before removal
  targetBlank: /\{:target="[_\\]*blank"?\}/gi,
  imageSize: /\{:\s*width="(\d+)"(?:\s*height="(\d+)")?\}/gi,
  cssClass: /\{:\.([a-z-]+)(?:\s+[^}]*)?\}/gi,
  inlineStyle: /\{:style="([^"]+)"\}/gi,
  idSelector: /\{:#([a-z-]+)\}/gi,
  // Catch-all pattern for final cleanup
  anyJekyll: /\{:[^}]+\}/g
};

/**
 * Analyze and categorize Jekyll syntax in content
 */
function analyzeContent(content, filename) {
  const lines = content.split('\n');
  let linkTargetCount = 0;

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Track link targets
    const targetMatches = line.match(patterns.targetBlank);
    if (targetMatches) {
      linkTargetCount += targetMatches.length;
    }

    // Track image sizing
    const imageSizeMatches = [...line.matchAll(new RegExp(patterns.imageSize, 'g'))];
    for (const match of imageSizeMatches) {
      removals.imageSizing.push({
        file: filename,
        line: lineNum,
        content: match[0],
        dimensions: { width: match[1], height: match[2] || 'auto' }
      });
    }

    // Track CSS classes
    const cssClassMatches = [...line.matchAll(new RegExp(patterns.cssClass, 'g'))];
    for (const match of cssClassMatches) {
      removals.layoutStyling.push({
        file: filename,
        line: lineNum,
        content: match[0],
        classes: match[1]
      });
    }

    // Track inline styles
    const inlineStyleMatches = [...line.matchAll(new RegExp(patterns.inlineStyle, 'g'))];
    for (const match of inlineStyleMatches) {
      removals.other.push({
        file: filename,
        line: lineNum,
        content: match[0],
        type: 'inline-style',
        value: match[1]
      });
    }

    // Track ID selectors
    const idSelectorMatches = [...line.matchAll(new RegExp(patterns.idSelector, 'g'))];
    for (const match of idSelectorMatches) {
      removals.other.push({
        file: filename,
        line: lineNum,
        content: match[0],
        type: 'id-selector',
        value: match[1]
      });
    }
  });

  if (linkTargetCount > 0) {
    removals.linkTargets.push({
      file: filename,
      count: linkTargetCount
    });
  }
}

/**
 * Remove all Jekyll syntax from content
 */
function removeJekyllSyntax(content) {
  // Remove all Jekyll attribute syntax
  return content.replace(patterns.anyJekyll, '');
}

/**
 * Process all markdown files in the blog directory
 */
function processFiles() {
  const files = fs.readdirSync(BLOG_DIR);
  const mdFiles = files.filter(f => f.endsWith('.md'));

  console.log(`Found ${mdFiles.length} markdown files in ${BLOG_DIR}`);
  console.log('Processing files...\n');

  let processedCount = 0;
  let modifiedCount = 0;

  mdFiles.forEach(file => {
    const filePath = path.join(BLOG_DIR, file);
    const originalContent = fs.readFileSync(filePath, 'utf8');

    // Analyze for tracking
    analyzeContent(originalContent, file);

    // Remove Jekyll syntax
    const cleanedContent = removeJekyllSyntax(originalContent);

    // Write back if changed
    if (originalContent !== cleanedContent) {
      fs.writeFileSync(filePath, cleanedContent, 'utf8');
      modifiedCount++;
      console.log(`✓ Modified: ${file}`);
    }

    processedCount++;
  });

  console.log(`\nProcessed ${processedCount} files, modified ${modifiedCount} files`);

  return {
    total: processedCount,
    modified: modifiedCount
  };
}

/**
 * Generate MIGRATION_NOTES.md documentation
 */
function generateMigrationNotes(stats) {
  const totalRemovals =
    removals.linkTargets.reduce((sum, item) => sum + item.count, 0) +
    removals.imageSizing.length +
    removals.layoutStyling.length +
    removals.other.length;

  let content = `# Jekyll Syntax Migration Notes

This document tracks the removal of legacy Jekyll/Kramdown syntax from blog markdown files.

**Migration Date:** ${new Date().toISOString().split('T')[0]}
**Total Removals:** ${totalRemovals} instances across ${stats.modified} files

---

## Summary

- **Link Targets Removed:** ${removals.linkTargets.reduce((sum, item) => sum + item.count, 0)} instances
- **Image Sizing Removed:** ${removals.imageSizing.length} instances
- **Layout Styling Removed:** ${removals.layoutStyling.length} instances
- **Other Removals:** ${removals.other.length} instances

---

## Section 1: Image Sizing Removals

**Total:** ${removals.imageSizing.length} instances

The following image sizing attributes were removed. These can be re-added using HTML \`<img>\` tags if needed:

`;

  if (removals.imageSizing.length > 0) {
    // Group by file
    const byFile = {};
    removals.imageSizing.forEach(item => {
      if (!byFile[item.file]) byFile[item.file] = [];
      byFile[item.file].push(item);
    });

    Object.keys(byFile).sort().forEach(file => {
      content += `\n### ${file}\n\n`;
      byFile[file].forEach(item => {
        content += `- Line ${item.line}: \`${item.content}\` → width="${item.dimensions.width}" height="${item.dimensions.height}"\n`;
      });
    });
  } else {
    content += '\n*No image sizing attributes found.*\n';
  }

  content += `\n---

## Section 2: Layout Styling Removals

**Total:** ${removals.layoutStyling.length} instances

The following CSS class applications were removed (\`.pull-left\`, \`.pull-right\`, etc.). These can be modernized with Tailwind utilities if needed:

`;

  if (removals.layoutStyling.length > 0) {
    // Group by file
    const byFile = {};
    removals.layoutStyling.forEach(item => {
      if (!byFile[item.file]) byFile[item.file] = [];
      byFile[item.file].push(item);
    });

    Object.keys(byFile).sort().forEach(file => {
      content += `\n### ${file}\n\n`;
      byFile[file].forEach(item => {
        content += `- Line ${item.line}: \`${item.content}\` → class="${item.classes}"\n`;
      });
    });
  } else {
    content += '\n*No layout styling classes found.*\n';
  }

  content += `\n---

## Section 3: Link Target Removals

**Total:** ${removals.linkTargets.reduce((sum, item) => sum + item.count, 0)} instances

All \`{:target="_blank"}\` and variant patterns were removed. External links automatically open in new tabs via the \`rehype-external-links\` plugin configured in Astro.

**Files affected:**

`;

  if (removals.linkTargets.length > 0) {
    removals.linkTargets.sort((a, b) => b.count - a.count).forEach(item => {
      content += `- ${item.file}: ${item.count} instance${item.count > 1 ? 's' : ''}\n`;
    });
  } else {
    content += '\n*No link target attributes found.*\n';
  }

  content += `\n---

## Section 4: Other Removals

**Total:** ${removals.other.length} instances

`;

  if (removals.other.length > 0) {
    // Group by type
    const byType = {};
    removals.other.forEach(item => {
      if (!byType[item.type]) byType[item.type] = [];
      byType[item.type].push(item);
    });

    Object.keys(byType).forEach(type => {
      content += `\n### ${type}\n\n`;
      byType[type].forEach(item => {
        content += `- ${item.file}:${item.line} → \`${item.content}\` (value: "${item.value}")\n`;
      });
    });
  } else {
    content += '\n*No other removals.*\n';
  }

  content += `\n---

## Next Steps

1. ✅ All Jekyll syntax has been removed
2. ⏭️ Build the site to verify no markdown parsing errors
3. ⏭️ Manually review sample blog posts to check rendering
4. ⏭️ If layout issues occur, refer to this document to restore specific styling
5. ⏭️ Consider modernizing layout with Tailwind CSS utilities where needed

---

**Note:** This migration was performed automatically using \`scripts/remove-jekyll-syntax.js\`. The original Jekyll syntax is documented above for reference if any styling needs to be restored.
`;

  fs.writeFileSync(MIGRATION_NOTES_PATH, content, 'utf8');
  console.log(`\n✓ Generated: MIGRATION_NOTES.md`);
}

/**
 * Main execution
 */
function main() {
  console.log('='.repeat(60));
  console.log('Jekyll Syntax Removal Migration Script');
  console.log('='.repeat(60));
  console.log();

  const stats = processFiles();
  generateMigrationNotes(stats);

  console.log();
  console.log('='.repeat(60));
  console.log('Migration complete!');
  console.log('='.repeat(60));
  console.log();
  console.log('Next steps:');
  console.log('1. Review MIGRATION_NOTES.md');
  console.log('2. Run: npm run build');
  console.log('3. Manually check sample blog posts');
  console.log();
}

// Run the script
main();
