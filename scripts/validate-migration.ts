import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

interface ValidationResult {
  file: string;
  errors: string[];
  warnings: string[];
}

const REQUIRED_FIELDS = ['permalink', 'title', 'authors', 'published', 'tags', 'publishedDate'];
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

function validateArticle(
  filename: string,
  fileContent: string,
  validAuthorIds: Set<string>
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const { data } = matter(fileContent);

    // Check required fields
    for (const field of REQUIRED_FIELDS) {
      if (!data[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate permalink
    if (data.permalink && typeof data.permalink !== 'string') {
      errors.push('permalink must be a string');
    }

    // Validate title
    if (data.title && typeof data.title !== 'string') {
      errors.push('title must be a string');
    }

    // Validate excerpt (optional)
    if (data.excerpt && typeof data.excerpt !== 'string') {
      errors.push('excerpt must be a string');
    }

    // Validate authors
    if (data.authors) {
      if (!Array.isArray(data.authors)) {
        errors.push('authors must be an array');
      } else {
        if (data.authors.length === 0) {
          errors.push('authors array cannot be empty');
        }

        // Check each author exists
        for (const authorId of data.authors) {
          if (!validAuthorIds.has(authorId)) {
            errors.push(`Invalid author reference: ${authorId}`);
          }
        }
      }
    }

    // Validate published
    if (data.published) {
      if (!['draft', 'published'].includes(data.published)) {
        errors.push("published must be 'draft' or 'published'");
      }
    }

    // Validate tags
    if (data.tags) {
      if (!Array.isArray(data.tags)) {
        errors.push('tags must be an array');
      } else if (data.tags.length === 0) {
        warnings.push('tags array is empty');
      }
    }

    // Validate categories (optional)
    if (data.categories) {
      if (!Array.isArray(data.categories)) {
        errors.push('categories must be an array');
      } else {
        for (const cat of data.categories) {
          if (!VALID_CATEGORIES.includes(cat)) {
            errors.push(`Invalid category: ${cat}`);
          }
        }

        if (data.categories.length > 1) {
          warnings.push(`Has ${data.categories.length} categories (recommended: 1)`);
        }
      }
    } else {
      warnings.push('No categories assigned');
    }

    // Validate publishedDate
    if (data.publishedDate) {
      const dateStr = String(data.publishedDate);
      if (!/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        errors.push('publishedDate must be in YYYY-MM-DD format');
      }
    }

    // Check for old fields that should be removed
    if (data.layout) {
      warnings.push('Old field "layout" still present');
    }
    if (data.breadcrumb) {
      warnings.push('Old field "breadcrumb" still present');
    }
    if (data.author && !data.authors) {
      errors.push('Old field "author" found instead of "authors"');
    }
    if (data.date && !data.publishedDate) {
      errors.push('Old field "date" found instead of "publishedDate"');
    }

    // Excerpt check
    if (!data.excerpt) {
      warnings.push('No excerpt field (may be optional)');
    }
  } catch (error) {
    errors.push(`Failed to parse: ${error}`);
  }

  return { file: filename, errors, warnings };
}

function loadValidAuthorIds(): Set<string> {
  const peopleDir = path.join(process.cwd(), 'src/content/people');
  const files = fs.readdirSync(peopleDir).filter((f) => f.endsWith('.json'));

  const authorIds = new Set<string>();

  for (const file of files) {
    const id = file.replace('.json', '');
    authorIds.add(id);
  }

  return authorIds;
}

function main() {
  console.log('='.repeat(60));
  console.log('  M-Lab Article Migration Validator');
  console.log('='.repeat(60));

  // Load valid author IDs
  const validAuthorIds = loadValidAuthorIds();
  console.log(`\nLoaded ${validAuthorIds.size} valid author IDs from people collection\n`);

  // Get all articles
  const articlesDir = path.join(process.cwd(), 'src/content/articles');
  const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith('.md'));

  console.log(`Validating ${files.length} articles...\n`);

  const results: ValidationResult[] = [];
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const file of files) {
    const filePath = path.join(articlesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    const result = validateArticle(file, content, validAuthorIds);
    results.push(result);

    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;

    if (result.errors.length > 0 || result.warnings.length > 0) {
      console.log(`\n${file}:`);
      if (result.errors.length > 0) {
        result.errors.forEach((err) => console.log(`  ❌ ERROR: ${err}`));
      }
      if (result.warnings.length > 0) {
        result.warnings.forEach((warn) => console.log(`  ⚠️  WARNING: ${warn}`));
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Validation Summary');
  console.log('='.repeat(60));
  console.log(`Total Articles: ${files.length}`);
  console.log(`Total Errors: ${totalErrors}`);
  console.log(`Total Warnings: ${totalWarnings}`);

  const articlesWithErrors = results.filter((r) => r.errors.length > 0).length;
  const articlesWithWarnings = results.filter((r) => r.warnings.length > 0).length;
  const cleanArticles = results.filter((r) => r.errors.length === 0 && r.warnings.length === 0).length;

  console.log(`\nClean Articles: ${cleanArticles}`);
  console.log(`Articles with Warnings: ${articlesWithWarnings}`);
  console.log(`Articles with Errors: ${articlesWithErrors}`);

  // Category distribution
  console.log('\n' + '-'.repeat(60));
  console.log('Category Distribution:');
  const categoryCount: { [key: string]: number } = {};

  for (const file of files) {
    const filePath = path.join(articlesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(content);

    if (data.categories && Array.isArray(data.categories)) {
      for (const cat of data.categories) {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      }
    }
  }

  for (const cat of VALID_CATEGORIES) {
    const count = categoryCount[cat] || 0;
    console.log(`  ${cat}: ${count}`);
  }

  // Excerpt statistics
  const articlesWithExcerpt = results.filter((r) => {
    const filePath = path.join(articlesDir, r.file);
    const content = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(content);
    return !!data.excerpt;
  }).length;

  console.log('\n' + '-'.repeat(60));
  console.log('Excerpt Statistics:');
  console.log(`  With Excerpt: ${articlesWithExcerpt}`);
  console.log(`  Without Excerpt: ${files.length - articlesWithExcerpt}`);
  console.log(`  Coverage: ${Math.round((articlesWithExcerpt / files.length) * 100)}%`);

  if (totalErrors > 0) {
    console.log('\n❌ Validation failed. Please fix the errors above.');
    process.exit(1);
  } else {
    console.log('\n✓ Validation passed!');
    if (totalWarnings > 0) {
      console.log(`  (${totalWarnings} warnings - these are informational only)`);
    }
    console.log('\nNext step: Run `npm run build` to test Astro build');
  }
}

main();
