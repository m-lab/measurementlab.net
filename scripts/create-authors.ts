import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

interface Person {
  id: string;
  name: string;
  headshot: string;
  title: string;
  sections: string[];
}

interface AuthorStats {
  name: string;
  id: string;
  articleCount: number;
}

function getAuthorArticleCount(authorId: string, authorMapping: { [name: string]: string }): number {
  let count = 0;

  // Count articles by this author
  const articlesDir = path.join(process.cwd(), 'src/content/articles');
  const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith('.md'));

  for (const file of files) {
    const filePath = path.join(articlesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    try {
      const { data } = matter(content);
      if (data.author) {
        const authors = data.author
          .split(',')
          .map((a: string) => a.trim())
          .filter((a: string) => a);

        for (const authorName of authors) {
          if (authorMapping[authorName] === authorId) {
            count++;
            break; // Count each article only once per author
          }
        }
      }
    } catch (error) {
      // Skip
    }
  }

  return count;
}

function determineTitle(articleCount: number, authorName: string): string {
  // Special titles for known team members
  if (authorName.toLowerCase().includes('mlab') || authorName.toLowerCase().includes('measurement lab')) {
    return 'M-Lab Team';
  }

  // Based on contribution level
  if (articleCount >= 10) {
    return 'Senior Researcher';
  } else if (articleCount >= 5) {
    return 'Researcher';
  } else {
    return 'Research Contributor';
  }
}

function createAuthorFiles() {
  const mappingPath = path.join(process.cwd(), 'scripts/author-mapping.json');

  if (!fs.existsSync(mappingPath)) {
    console.error('Error: author-mapping.json not found!');
    console.error('Please run generate-author-mapping.ts first.');
    process.exit(1);
  }

  const authorMapping: { [name: string]: string } = JSON.parse(
    fs.readFileSync(mappingPath, 'utf8')
  );

  const peopleDir = path.join(process.cwd(), 'src/content/people');

  // Get article counts for each author
  const authorStats: AuthorStats[] = Object.entries(authorMapping).map(([name, id]) => ({
    name,
    id,
    articleCount: getAuthorArticleCount(id, authorMapping),
  }));

  // Sort by article count
  authorStats.sort((a, b) => b.articleCount - a.articleCount);

  console.log('='.repeat(60));
  console.log('  M-Lab Author Profile Creator');
  console.log('='.repeat(60));
  console.log(`\nCreating ${authorStats.length} author profiles...\n`);

  let created = 0;
  let skipped = 0;

  for (const { name, id, articleCount } of authorStats) {
    const filePath = path.join(peopleDir, `${id}.json`);

    // Skip if already exists
    if (fs.existsSync(filePath)) {
      console.log(`⊘ Skipped ${id} (already exists)`);
      skipped++;
      continue;
    }

    const person: Person = {
      id,
      name,
      headshot: '/src/assets/people/placeholder.png',
      title: determineTitle(articleCount, name),
      sections: ['Community'],
    };

    fs.writeFileSync(filePath, JSON.stringify(person, null, 2) + '\n');
    console.log(`✓ Created ${id} (${articleCount} articles) - ${person.title}`);
    created++;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Summary: ${created} created, ${skipped} skipped`);
  console.log('='.repeat(60));

  // Display top contributors
  console.log('\nTop 10 Contributors:');
  console.log('-'.repeat(60));
  for (const { name, articleCount } of authorStats.slice(0, 10)) {
    console.log(`${articleCount.toString().padStart(3)} articles | ${name}`);
  }

  console.log('\nNext step: Run migrate-articles.ts to transform article frontmatter');
}

createAuthorFiles();
