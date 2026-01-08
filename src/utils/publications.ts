import { getCollection, type CollectionEntry } from 'astro:content';

export type Publication = CollectionEntry<'publications'>;

export interface PublicationCardData {
	publication: Publication;
	formattedYear: string;
}

/**
 * Get all publications sorted by year (newest first), then alphabetically by title
 */
export async function getPublications() {
	const allPublications = await getCollection('publications');
	
	return allPublications.sort((a, b) => {
		// First sort by year (descending)
		if (b.data.year !== a.data.year) {
			return b.data.year - a.data.year;
		}
		// Then sort alphabetically by title
		return a.data.title.localeCompare(b.data.title);
	});
}

/**
 * Prepare publications data for card display
 */
export function preparePublicationsCardData(
	publications: Publication[]
): PublicationCardData[] {
	return publications.map((publication) => ({
		publication,
		formattedYear: publication.data.year.toString(),
	}));
}

/**
 * Format category for display (e.g., "research-papers" -> "Research Papers")
 */
export function formatCategory(category: string): string {
	return category
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}
