import { eq } from 'drizzle-orm';
import { db } from '../connection';
import { Edition, editionsTable } from '../schema';

export const getEditionsByNewsletterId = async (newsletterId: string): Promise<Edition[]> => {
	try {
		return await db.select().from(editionsTable).where(eq(editionsTable.newsletterId, newsletterId));
	} catch (e) {
		console.error("Unable to get editions: ", e);
	}
	return [];
}

export const getEditionById = async (id: string): Promise<Edition | null> => {
	try {
		return (await db.select().from(editionsTable).where(eq(editionsTable.id, id)))[0];
	} catch (e) {
		console.error("Unable to get edition: ", e);
	}
	return null;
}

export const createEdition = async (newsletterId: string, contents?: string): Promise<Edition | null> => {
	try {
		return (await db.insert(editionsTable).values({
			newsletterId, contents
		}).returning())[0];
	} catch (e) {
		console.error("Unable to create edition: ", e);
	}
	return null;
}

export const updateEdition = async (id: string, contents: string): Promise<Edition | null> => {
	try {
		return (await db.update(editionsTable).set({
			contents
		}).where(eq(editionsTable.id, id)).returning())[0];
	} catch (e) {
		console.error("Unable to update edition: ", e);
	}
	return null;
}

export const deleteEdition = async (id: string): Promise<void> => {
	try {
		await db.delete(editionsTable).where(eq(editionsTable.id, id));
	} catch (e) {
		console.error("Unable to delete edition: ", e);
	}
}
