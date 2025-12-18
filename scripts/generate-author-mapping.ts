import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

interface AuthorMapping {
  [fullName: string]: {
    id: string;
    count: number;
  };
}

function generateAuthorId(fullName: string): string {
  // Remove organization markers and extra whitespace
  const cleaned = fullName
    .replace(/\(M-Lab\)/gi, '')
    .replace(/\(OONI\)/gi, '')
    .replace(/\(Open Observatory of Network Interference\)/gi, '')
    .trim();

  // Handle special cases
  const lower = cleaned.toLowerCase();
  if (
    lower === 'measurement lab' ||
    lower === 'm-lab team' ||
    lower === 'mlab team' ||
    lower === 'the m-lab team'
  ) {
    return 'mlab-team';
  }

  // Split name and convert to kebab-case
  const parts = cleaned.split(/\s+/);
  return parts
    .map((p) => p.toLowerCase())
    .join('-')
    .replace(/[^a-z0-9-]/g, '');
}

function extractAuthorsFromArticles(): AuthorMapping {
  const articlesDir = path.join(process.cwd(), 'src/content/articles');
  const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith('.md'));

  const authorMapping: AuthorMapping = {};

  console.log(`\nScanning ${files.length} articles for authors...\n`);

  for (const file of files) {
    const filePath = path.join(articlesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    try {
      const { data } = matter(content);

      if (data.author) {
        // Split by comma to handle multi-author fields
        const authors = data.author
          .split(',')
          .map((a: string) => a.trim())
          .filter((a: string) => a);

        for (const authorName of authors) {
          if (!authorMapping[authorName]) {
            authorMapping[authorName] = {
              id: generateAuthorId(authorName),
              count: 0,
            };
          }
          authorMapping[authorName].count++;
        }
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }

  return authorMapping;
}

function main() {
  console.log('='.repeat(60));
  console.log('  M-Lab Article Author Mapping Generator');
  console.log('='.repeat(60));

  const authorMapping = extractAuthorsFromArticles();

  // Sort by count (descending)
  const sorted = Object.entries(authorMapping).sort(
    (a, b) => b[1].count - a[1].count
  );

  console.log(`\nFound ${sorted.length} unique authors:\n`);
  console.log('Count | Author Name → Author ID');
  console.log('-'.repeat(60));

  for (const [name, { id, count }] of sorted) {
    console.log(`${count.toString().padStart(5)} | ${name} → ${id}`);
  }

  // Convert to simple mapping for use in other scripts
  const simpleMapping: { [name: string]: string } = {};
  for (const [name, { id }] of Object.entries(authorMapping)) {
    simpleMapping[name] = id;
  }

  // Save to file
  const outputPath = path.join(process.cwd(), 'scripts/author-mapping.json');
  fs.writeFileSync(outputPath, JSON.stringify(simpleMapping, null, 2));

  console.log(`\n✓ Author mapping saved to: ${outputPath}`);
  console.log('\nNext step: Run create-authors.ts to generate people collection files');
}

main();
