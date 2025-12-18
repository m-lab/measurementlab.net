import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import yaml from 'js-yaml';

interface OldFrontmatter {
  layout?: string;
  title: string;
  author?: string;
  date: string;
  breadcrumb?: string;
  categories?: string[];
}

interface NewFrontmatter {
  permalink: string;
  title: string;
  excerpt?: string;
  authors: string[];
  published: 'draft' | 'published';
  tags: string[];
  categories?: string[];
  publishedDate: string;
}

const VALID_CATEGORIES = [
  'Technology',
  'Development',
  'Design',
  'Product',
  'Business',
  'Tutorial',
  'News',
  'Opinion',
];

function generatePermalink(filename: string): string {
  // Remove date prefix (YYYY-MM-DD-) and .md extension
  return filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
}

function extractExcerpt(content: string): { excerpt: string | undefined; cleanedContent: string } {
  const moreMatch = content.match(/^([\s\S]*?)<!--more-->/);

  if (!moreMatch) {
    return { excerpt: undefined, cleanedContent: content };
  }

  let excerpt = moreMatch[1].trim();

  // Remove markdown images
  excerpt = excerpt.replace(/!\[.*?\]\(.*?\)/g, '');

  // Convert links to text
  excerpt = excerpt.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

  // Clean up whitespace
  excerpt = excerpt.replace(/\s+/g, ' ').trim();

  // Limit length
  if (excerpt.length > 300) {
    excerpt = excerpt.substring(0, 297) + '...';
  }

  // Remove the <!--more--> marker from content
  const cleanedContent = content.replace('<!--more-->', '').trim();

  return { excerpt: excerpt || undefined, cleanedContent };
}

function mapAuthors(
  authorString: string | undefined,
  authorMapping: { [name: string]: string }
): string[] {
  if (!authorString) {
    return ['mlab-team'];
  }

  const authorNames = authorString
    .split(',')
    .map((a) => a.trim())
    .filter((a) => a);

  const authorIds = authorNames
    .map((name) => authorMapping[name])
    .filter((id) => id);

  return authorIds.length > 0 ? authorIds : ['mlab-team'];
}

function normalizeTags(categories: string[] | undefined): string[] {
  if (!categories) {
    return [];
  }

  return categories.map((cat) =>
    cat
      .toLowerCase()
      .replace(/_/g, '-')
      .replace(/\s+/g, '-')
  );
}

function classifyArticle(title: string, tags: string[]): string[] {
  const titleLower = title.toLowerCase();

  // Tutorial
  if (
    titleLower.includes('tutorial') ||
    titleLower.includes('how to') ||
    titleLower.includes('guide') ||
    titleLower.includes('getting started')
  ) {
    return ['Tutorial'];
  }

  // News/Announcements
  if (
    tags.includes('announcement') ||
    tags.includes('event') ||
    titleLower.includes('announcing') ||
    titleLower.includes('introducing') ||
    titleLower.includes('update') ||
    titleLower.includes('new')
  ) {
    return ['News'];
  }

  // Technology (technical content)
  const techKeywords = [
    'ndt',
    'traceroute',
    'bbr',
    'tcp-info',
    'tcp',
    'kernel',
    'performance',
    'network',
    'measurement',
    'protocol',
  ];
  if (tags.some((t) => techKeywords.includes(t))) {
    return ['Technology'];
  }

  // Development (data/infrastructure)
  const devKeywords = [
    'pipeline',
    'bigquery',
    'data',
    'schema',
    'platform',
    'infrastructure',
    'etl',
  ];
  if (tags.some((t) => devKeywords.includes(t))) {
    return ['Development'];
  }

  // Opinion/Research
  if (tags.includes('research') || tags.includes('community')) {
    return ['Opinion'];
  }

  // Default
  return ['Technology'];
}

function transformArticle(
  filename: string,
  fileContent: string,
  authorMapping: { [name: string]: string },
  dryRun: boolean
): { success: boolean; error?: string } {
  try {
    const { data: oldData, content } = matter(fileContent);
    const old = oldData as OldFrontmatter;

    // Generate permalink
    const permalink = generatePermalink(filename);

    // Map authors
    const authors = mapAuthors(old.author, authorMapping);

    // Extract excerpt and clean content
    const { excerpt, cleanedContent } = extractExcerpt(content);

    // Normalize tags (from old categories)
    const tags = normalizeTags(old.categories);

    // Classify into one category
    const categories = classifyArticle(old.title, tags);

    // Extract just YYYY-MM-DD from the date (strip time if present)
    let dateString = old.date;
    if (typeof dateString === 'object' && dateString instanceof Date) {
      dateString = dateString.toISOString().split('T')[0];
    } else if (typeof dateString === 'string') {
      // If it's a string with timestamp, extract just the date part
      dateString = dateString.split('T')[0];
    }

    // Build new frontmatter
    const newFrontmatter: NewFrontmatter = {
      permalink,
      title: old.title,
      ...(excerpt ? { excerpt } : {}),
      authors,
      published: 'published',
      tags,
      ...(categories.length > 0 ? { categories } : {}),
      publishedDate: dateString,
    };

    if (dryRun) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`File: ${filename}`);
      console.log('-'.repeat(60));
      console.log('OLD FRONTMATTER:');
      console.log(yaml.dump(old));
      console.log('NEW FRONTMATTER:');
      console.log(yaml.dump(newFrontmatter));
      if (excerpt) {
        console.log(`Excerpt: ${excerpt.substring(0, 100)}...`);
      }
      return { success: true };
    }

    // Write transformed article
    const articlesDir = path.join(process.cwd(), 'src/content/articles');
    const filePath = path.join(articlesDir, filename);

    let newContent = matter.stringify(cleanedContent, newFrontmatter);

    // Fix date quoting - remove quotes around YYYY-MM-DD dates so they parse as Date objects
    newContent = newContent.replace(/publishedDate: '(\d{4}-\d{2}-\d{2})'/g, 'publishedDate: $1');

    fs.writeFileSync(filePath, newContent);

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  console.log('='.repeat(60));
  console.log('  M-Lab Article Migration');
  console.log('='.repeat(60));
  console.log(`Mode: ${dryRun ? 'DRY RUN (preview only)' : 'EXECUTE (will modify files)'}`);
  console.log('='.repeat(60));

  // Load author mapping
  const mappingPath = path.join(process.cwd(), 'scripts/author-mapping.json');
  if (!fs.existsSync(mappingPath)) {
    console.error('\n❌ Error: author-mapping.json not found!');
    console.error('Please run generate-author-mapping.ts first.');
    process.exit(1);
  }

  const authorMapping: { [name: string]: string } = JSON.parse(
    fs.readFileSync(mappingPath, 'utf8')
  );

  // Get all article files
  const articlesDir = path.join(process.cwd(), 'src/content/articles');
  const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith('.md'));

  console.log(`\nProcessing ${files.length} articles...\n`);

  let successful = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const file of files) {
    const filePath = path.join(articlesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    const result = transformArticle(file, content, authorMapping, dryRun);

    if (result.success) {
      if (!dryRun) {
        console.log(`✓ ${file}`);
      }
      successful++;
    } else {
      console.error(`✗ ${file}: ${result.error}`);
      errors.push(`${file}: ${result.error}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Summary: ${successful} successful, ${failed} failed`);
  console.log('='.repeat(60));

  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach((err) => console.log(`  - ${err}`));
  }

  if (dryRun) {
    console.log('\n⚠️  This was a DRY RUN. No files were modified.');
    console.log('Run without --dry-run to execute the migration.');
  } else {
    console.log('\n✓ Migration complete!');
    console.log('Next step: Run validate-migration.ts to check for errors');
  }
}

main();
