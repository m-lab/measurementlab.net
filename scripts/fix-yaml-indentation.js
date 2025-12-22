#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, '..', 'src', 'content', 'blog');

/**
 * Fix YAML frontmatter indentation issues in markdown files
 * Specifically fixes excerpt fields where the first line has 3 spaces instead of 2
 */
function fixYamlIndentation(content) {
  const lines = content.split('\n');
  const fixedLines = [];
  let inFrontmatter = false;
  let inExcerpt = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track frontmatter boundaries
    if (line === '---') {
      if (!inFrontmatter) {
        inFrontmatter = true;
      } else {
        inFrontmatter = false;
        inExcerpt = false;
      }
      fixedLines.push(line);
      continue;
    }

    // Detect excerpt field
    if (inFrontmatter && line.match(/^excerpt:\s*>-/)) {
      inExcerpt = true;
      fixedLines.push(line);
      continue;
    }

    // Exit excerpt when we hit another field
    if (inFrontmatter && inExcerpt && line.match(/^[a-z]/)) {
      inExcerpt = false;
    }

    // Fix indentation in excerpt field
    if (inFrontmatter && inExcerpt) {
      // If line starts with 3 spaces, change to 2 spaces
      if (line.match(/^   /)) {
        fixedLines.push(line.replace(/^   /, '  '));
        continue;
      }
    }

    fixedLines.push(line);
  }

  return fixedLines.join('\n');
}

/**
 * Process all markdown files
 */
function main() {
  const files = fs.readdirSync(BLOG_DIR);
  const mdFiles = files.filter(f => f.endsWith('.md'));

  console.log(`Checking ${mdFiles.length} markdown files for YAML indentation issues...\n`);

  let fixedCount = 0;

  for (const file of mdFiles) {
    const filePath = path.join(BLOG_DIR, file);
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixYamlIndentation(originalContent);

    if (originalContent !== fixedContent) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`✓ Fixed: ${file}`);
      fixedCount++;
    }
  }

  console.log(`\nFixed ${fixedCount} files`);
}

main();
