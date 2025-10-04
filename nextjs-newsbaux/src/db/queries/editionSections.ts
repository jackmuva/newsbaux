import { eq } from 'drizzle-orm';
import { db } from '../connection';
import { EditionSection, editionSectionTable } from '../schema';

export const getEditionSectionsByEditionId = async (editionId: string): Promise<EditionSection[]> => {
	try {
		return await db.select().from(editionSectionTable).where(eq(editionSectionTable.editionId, editionId));
	} catch (e) {
		console.error("Unable to get edition sections: ", e);
	}
	return [];
}

export const createEditionSection = async (editionId: string, newsSectionId: string, contents?: string): Promise<EditionSection | null> => {
	try {
		return (await db.insert(editionSectionTable).values({
			editionId, newsSectionId, contents
		}).returning())[0];
	} catch (e) {
		console.error("Unable to create edition section: ", e);
	}
	return null;
}

export const updateEditionSection = async (id: string, contents: string): Promise<EditionSection | null> => {
	try {
		return (await db.update(editionSectionTable).set({
			contents
		}).where(eq(editionSectionTable.id, id)).returning())[0];
	} catch (e) {
		console.error("Unable to update edition section: ", e);
	}
	return null;
}

export const deleteEditionSection = async (id: string): Promise<void> => {
	try {
		await db.delete(editionSectionTable).where(eq(editionSectionTable.id, id));
	} catch (e) {
		console.error("Unable to delete edition section: ", e);
	}
}
