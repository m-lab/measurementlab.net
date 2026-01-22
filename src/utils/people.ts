import { type CollectionEntry, getCollection } from 'astro:content';

export type Person = CollectionEntry<'people'>;

export interface PersonData {
  id: string;
  name: string;
  title?: string;
  headshot?: any;
  [key: string]: any;
}

/**
 * Creates a map of people by ID for quick lookups
 * @returns Map of person ID to person data
 */
export async function getPeopleMap(): Promise<Map<string, PersonData>> {
  const allPeople = await getCollection('people');
  return new Map(
    allPeople.map((person) => [person.data.id, person.data as PersonData])
  );
}

/**
 * Resolves person IDs to person names
 * @param personIds - Array of person IDs
 * @param peopleMap - Optional pre-built people map (for performance)
 * @returns Comma-separated person names
 */
export async function getPersonNames(
  personIds: string[] | undefined,
  peopleMap?: Map<string, PersonData>
): Promise<string> {
  if (!personIds || personIds.length === 0) {
    return '';
  }
  const map = peopleMap ?? (await getPeopleMap());
  return personIds
    .map((id) => map.get(id)?.name)
    .filter(Boolean)
    .join(', ');
}

/**
 * Resolves person IDs to full person data
 * @param personIds - Array of person IDs
 * @param peopleMap - Optional pre-built people map
 * @returns Array of resolved person data
 */
export async function resolvePeople(
  personIds: string[] | undefined,
  peopleMap?: Map<string, PersonData>
): Promise<PersonData[]> {
  if (!personIds || personIds.length === 0) {
    return [];
  }
  const map = peopleMap ?? (await getPeopleMap());
  return personIds
    .map((id) => map.get(id))
    .filter((person): person is PersonData => person !== undefined);
}

/**
 * Combines internal author names (from people collection) and external author names
 * @param personIds - Array of person IDs (internal authors)
 * @param externalAuthors - Comma-separated string of external author names
 * @param peopleMap - Optional pre-built people map
 * @returns Comma-separated string of all author names (internal first, then external)
 */
export async function getAllAuthorNames(
  personIds: string[] | undefined,
  externalAuthors: string | undefined,
  peopleMap?: Map<string, PersonData>
): Promise<string> {
  const internalNames = await getPersonNames(personIds, peopleMap);

  if (!externalAuthors) {
    return internalNames;
  }

  if (!internalNames) {
    return externalAuthors;
  }

  return `${internalNames}, ${externalAuthors}`;
}
