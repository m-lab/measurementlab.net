#!/usr/bin/env node

/**
 * Script to match publication authors to people in the people collection
 * and add them as contributors.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PEOPLE_DIR = path.join(__dirname, '../src/content/people');
const PUBLICATIONS_DIR = path.join(__dirname, '../src/content/publications');
const DRY_RUN = process.argv.includes('--dry-run');

/**
 * Load all people from the people collection
 */
function loadPeople() {
  const people = [];
  const files = fs.readdirSync(PEOPLE_DIR).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filepath = path.join(PEOPLE_DIR, file);
    const content = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    people.push({
      id: content.id,
      name: content.name,
      // Create variations for matching
      fullName: content.name.toLowerCase(),
      lastName: content.name.split(' ').slice(-1)[0].toLowerCase(),
      firstInitial: content.name.split(' ')[0][0].toLowerCase(),
    });
  }

  return people;
}

/**
 * Parse author names from author string
 */
function parseAuthors(authorsString) {
  if (!authorsString) return [];

  // Split by common separators
  const authors = authorsString
    .split(/,|;|\band\b/)
    .map(a => a.trim())
    .filter(a => a.length > 0);

  return authors;
}

/**
 * Try to match an author name to a person in the collection
 */
function matchAuthor(authorName, people) {
  const cleanName = authorName.toLowerCase().trim();

  // Try exact match first
  for (const person of people) {
    if (person.fullName === cleanName) {
      return person.id;
    }
  }

  // Try "Initial. Surname" format (e.g., "M. Mathis" → "Matt Mathis")
  const initialMatch = cleanName.match(/^([a-z])\.\s*([a-z\s-]+)$/);
  if (initialMatch) {
    const [, initial, surname] = initialMatch;
    for (const person of people) {
      if (person.firstInitial === initial && person.lastName === surname.trim()) {
        return person.id;
      }
    }
  }

  // Try "Surname, Initial" format (e.g., "Mathis, M." → "Matt Mathis")
  const reversedMatch = cleanName.match(/^([a-z\s-]+),\s*([a-z])\.?$/);
  if (reversedMatch) {
    const [, surname, initial] = reversedMatch;
    for (const person of people) {
      if (person.firstInitial === initial && person.lastName === surname.trim()) {
        return person.id;
      }
    }
  }

  // Try last name only if it's unique
  const lastNameMatches = people.filter(p => p.lastName === cleanName);
  if (lastNameMatches.length === 1) {
    return lastNameMatches[0].id;
  }

  return null;
}

/**
 * Process all publications and match contributors
 */
function processPublications() {
  const people = loadPeople();
  console.log(`📚 Loaded ${people.length} people from people collection\n`);

  const publicationFiles = fs.readdirSync(PUBLICATIONS_DIR)
    .filter(f => f.endsWith('.json') && !f.startsWith('EXAMPLE'));

  let totalPublications = 0;
  let publicationsWithMatches = 0;
  let totalMatches = 0;
  const matches = [];

  for (const file of publicationFiles) {
    const filepath = path.join(PUBLICATIONS_DIR, file);
    const publication = JSON.parse(fs.readFileSync(filepath, 'utf-8'));

    totalPublications++;

    if (!publication.authors) continue;

    const authors = parseAuthors(publication.authors);
    const contributors = [];

    for (const authorName of authors) {
      const matchedId = matchAuthor(authorName, people);
      if (matchedId && !contributors.includes(matchedId)) {
        contributors.push(matchedId);
        totalMatches++;
        matches.push({
          publication: publication.title,
          author: authorName,
          matched: people.find(p => p.id === matchedId).name,
          id: matchedId,
        });
      }
    }

    if (contributors.length > 0) {
      publicationsWithMatches++;
      publication.contributors = contributors;

      if (!DRY_RUN) {
        fs.writeFileSync(filepath, JSON.stringify(publication, null, 2) + '\n');
      }
    }
  }

  return { totalPublications, publicationsWithMatches, totalMatches, matches };
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Publication Contributors Matcher\n');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }

  const { totalPublications, publicationsWithMatches, totalMatches, matches } = processPublications();

  console.log('\n📊 Results:');
  console.log(`  Total publications: ${totalPublications}`);
  console.log(`  Publications with matches: ${publicationsWithMatches}`);
  console.log(`  Total author matches: ${totalMatches}`);

  if (matches.length > 0) {
    console.log('\n✅ Matched authors:');
    const byPublication = matches.reduce((acc, match) => {
      if (!acc[match.publication]) acc[match.publication] = [];
      acc[match.publication].push(match);
      return acc;
    }, {});

    Object.entries(byPublication).forEach(([pub, authors]) => {
      console.log(`\n  "${pub.substring(0, 60)}..."`);
      authors.forEach(m => {
        console.log(`    ✓ "${m.author}" → ${m.matched} (${m.id})`);
      });
    });
  }

  if (!DRY_RUN && publicationsWithMatches > 0) {
    console.log(`\n✨ Updated ${publicationsWithMatches} publication files with contributors!`);
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
