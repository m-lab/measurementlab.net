#!/usr/bin/env node

/**
 * Migration script to convert publications.md into individual JSON files
 * for the Publications content collection.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PUBLICATIONS_MD = path.join(__dirname, '../publications.md');
const OUTPUT_DIR = path.join(__dirname, '../src/content/publications');
const DRY_RUN = process.argv.includes('--dry-run');

// Category mappings
const CATEGORY_SECTIONS = {
  Papers: 'paper',
  'Government / Regulatory Filings': 'regulatory-filing',
  Presentations: 'presentation',
  'Other M-Lab Documentation': 'documentation',
};

/**
 * Clean legacy Jekyll/Liquid syntax from text
 */
function cleanLegacySyntax(text) {
  if (!text) return text;

  return text
    // Remove {{ site.baseurl }}
    .replace(/\{\{\s*site\.baseurl\s*\}\}/g, '')
    // Remove {:target="_blank"}
    .replace(/\{:target=["']_blank["']\}/g, '')
    // Remove {:.class-name}
    .replace(/\{:\.[\w-]+(?:\s+\.[\w-]+)*(?:\s+target=["']_blank["'])?\}/g, '')
    // Remove {:.no_toc}
    .replace(/\{:\.no_toc\}/g, '')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    // Trim
    .trim();
}

/**
 * Create a slug from a title
 */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80); // Limit length
}

/**
 * Extract links from markdown text and categorize them
 */
function extractLinks(text) {
  const internalLinks = [];
  const externalLinks = [];
  const videoLinks = [];

  // Regex to match markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = linkRegex.exec(text))) {
    const label = cleanLegacySyntax(match[1]);
    let url = cleanLegacySyntax(match[2]);

    // Skip empty labels or URLs
    if (!label || !url) continue;

    // Categorize the link
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      videoLinks.push({ label, url, platform: 'youtube' });
    } else if (url.includes('vimeo.com')) {
      videoLinks.push({ label, url, platform: 'vimeo' });
    } else if (url.includes('livestream.com')) {
      videoLinks.push({ label, url, platform: 'livestream' });
    } else if (url.startsWith('/publications/') || url.includes('{{ site.baseurl }}/publications/')) {
      // Internal PDF link
      const cleanPath = url
        .replace('/publications/', 'publications/')
        .replace(/^\//, '');
      internalLinks.push({ label, path: cleanPath });
    } else if (url.startsWith('http://') || url.startsWith('https://')) {
      // External link
      externalLinks.push({ label, url });
    } else {
      // Assume internal if it doesn't start with http
      console.warn(`Unclear link type: ${url}`);
    }
  }

  return { internalLinks, externalLinks, videoLinks };
}


/**
 * Parse a single publication entry
 */
function parsePublication(text, category, currentYear) {
  const lines = text.split('\n').filter(line => line.trim());

  let title = '';
  let description = '';
  let authors = '';
  let venue = '';
  const allLinks = [];
  let isMLabTeam = false;
  let inAuthorsSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines and markers
    if (!line || line === '{:.no_toc}') continue;

    // Title is usually the first heading
    if (line.startsWith('###') && !title) {
      title = cleanLegacySyntax(line.replace(/^###\s*/, ''));

      // Check for M-Lab team marker
      if (title.includes('\\*') || title.includes('(*)')) {
        isMLabTeam = true;
        title = title.replace(/\s*\\\*\s*$/, '').replace(/\s*\(\*\)\s*$/, '');
      }
      continue;
    }

    // Check for description marker
    if (line.includes('{:.paper-description}')) {
      continue;
    }

    // Check for author marker
    if (line.includes('{:.paper-author}')) {
      inAuthorsSection = true;
      continue;
    }

    // Check if line contains description text (long paragraph)
    if (!description && line.length > 100 && !line.startsWith('[')) {
      description = cleanLegacySyntax(line);
      continue;
    }

    // If we're in the authors section, capture the next non-empty line
    if (inAuthorsSection && !authors) {
      authors = cleanLegacySyntax(line);
      inAuthorsSection = false;
      continue;
    }

    // If no explicit author marker, try to detect authors after description
    if (!authors && description && !line.startsWith('[') && line.length < 200 && line.length > 10) {
      // Skip lines that are clearly not authors
      if (!line.toLowerCase().includes('download') &&
          !line.toLowerCase().startsWith('measurement lab') &&
          !line.match(/^https?:\/\//)) {
        authors = cleanLegacySyntax(line);
        continue;
      }
    }

    // Extract venue information
    if (line.match(/^[A-Z]{2,}.*\d{4}/) && !venue) {
      venue = cleanLegacySyntax(line);
      continue;
    }

    // Collect all link-containing lines
    if (line.includes('[') && line.includes('](')) {
      allLinks.push(line);
    }
  }

  // Extract and categorize links
  const linkText = allLinks.join(' ');
  const { internalLinks, externalLinks, videoLinks } = extractLinks(linkText);

  // Generate slug for ID
  const slug = slugify(title);
  const id = `${currentYear}-${slug}`;

  // Build publication object
  const publication = {
    id,
    title,
    ...(description && { description }),
    ...(authors && { authors }),
    year: currentYear,
    category,
    ...(internalLinks.length > 0 && { internalLinks }),
    ...(externalLinks.length > 0 && { externalLinks }),
    ...(videoLinks.length > 0 && { videoLinks }),
    ...(venue && { venue }),
  };

  // Add tags
  const tags = [];
  if (isMLabTeam) tags.push('mlab-team');
  if (tags.length > 0) publication.tags = tags;

  return publication;
}

/**
 * Parse publications.md file
 */
function parsePublicationsFile(content) {
  const publications = [];
  let currentCategory = null;
  let currentYear = null;

  // Split by main sections
  const sections = content.split(/^# /m).filter(s => s.trim());

  for (const section of sections) {
    const lines = section.split('\n');
    const sectionTitle = lines[0].trim();

    // Identify category
    for (const [key, value] of Object.entries(CATEGORY_SECTIONS)) {
      if (sectionTitle.includes(key)) {
        currentCategory = value;
        break;
      }
    }

    if (!currentCategory) continue;

    // Split section by h2 (years) and h3 (publications)
    const sectionContent = lines.slice(1).join('\n');
    const yearSections = sectionContent.split(/^## /m).filter(s => s.trim());

    for (const yearSection of yearSections) {
      const yearLines = yearSection.split('\n');
      const yearHeader = yearLines[0].trim();

      // Extract year
      const yearMatch = yearHeader.match(/\b(19|20)\d{2}\b/);
      if (yearMatch) {
        currentYear = parseInt(yearMatch[0]);
      } else if (!yearHeader.includes('{:.no_toc}')) {
        // If no year found and not a marker, skip
        continue;
      }

      // Split by h3 (individual publications)
      const pubSections = yearSection.split(/^### /m).filter(s => s.trim());

      for (let i = 1; i < pubSections.length; i++) {
        const pubText = '### ' + pubSections[i];

        try {
          const publication = parsePublication(pubText, currentCategory, currentYear || new Date().getFullYear());

          // Validate we have minimum required fields
          if (publication.title && publication.year && publication.category) {
            publications.push(publication);
          } else {
            console.warn(`Skipping publication with missing required fields: ${publication.title || 'Unknown'}`);
          }
        } catch (error) {
          console.error(`Error parsing publication: ${error.message}`);
        }
      }
    }
  }

  return publications;
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('📚 Publications Migration Script\n');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No files will be written\n');
  }

  // Read publications.md
  console.log(`Reading ${PUBLICATIONS_MD}...`);
  const content = fs.readFileSync(PUBLICATIONS_MD, 'utf-8');

  // Parse publications
  console.log('Parsing publications...');
  const publications = parsePublicationsFile(content);

  console.log(`\nFound ${publications.length} publications:`);

  // Count by category
  const counts = publications.reduce((acc, pub) => {
    acc[pub.category] = (acc[pub.category] || 0) + 1;
    return acc;
  }, {});

  Object.entries(counts).forEach(([category, count]) => {
    console.log(`  - ${category}: ${count}`);
  });

  if (!DRY_RUN) {
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Write each publication to a file
    console.log(`\nWriting to ${OUTPUT_DIR}...`);
    let written = 0;

    for (const pub of publications) {
      const filename = `${pub.id}.json`;
      const filepath = path.join(OUTPUT_DIR, filename);

      // Check for duplicates
      if (fs.existsSync(filepath)) {
        console.warn(`⚠️  File already exists: ${filename} - skipping`);
        continue;
      }

      fs.writeFileSync(filepath, JSON.stringify(pub, null, 2) + '\n');
      written++;
    }

    console.log(`\n✅ Successfully wrote ${written} publication files!`);
  } else {
    console.log('\n📋 Sample publications:');
    publications.slice(0, 3).forEach(pub => {
      console.log(`\n${pub.id}.json:`);
      console.log(JSON.stringify(pub, null, 2));
    });
  }

  console.log('\n✨ Migration complete!');
}

// Run migration
migrate().catch(error => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
