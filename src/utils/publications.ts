import { getCollection, type CollectionEntry } from 'astro:content';
import { getPeopleMap, getPersonNames, type PersonData } from '@utils/people';

export type Publication = CollectionEntry<'publications'>;

export interface PublicationCardData {
	post: Publication;
	authorNames: string;
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
 * Prepare publication data for card rendering
 * @param publication - The publication
 * @param peopleMap - Optional pre-built people map
 * @returns Data ready for card rendering
 */
export async function preparePublicationCardData(
	publication: Publication,
	peopleMap?: Map<string, PersonData>
): Promise<PublicationCardData> {
	return {
		post: publication,
		authorNames: await getPersonNames(publication.data.contributors, peopleMap),
	};
}

/**
 * Prepare multiple publications for card rendering (more efficient)
 * @param publications - Array of publications
 * @returns Array of data ready for card rendering
 */
export async function preparePublicationsCardData(
	publications: Publication[]
): Promise<PublicationCardData[]> {
	const peopleMap = await getPeopleMap();
	return Promise.all(
		publications.map((publication) =>
			preparePublicationCardData(publication, peopleMap)
		)
	);
}