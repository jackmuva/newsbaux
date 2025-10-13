import { eq } from 'drizzle-orm';
import { db } from '../connection';
import { Newsletter, newslettersTable } from '../schema';

export const getNewslettersByUserId = async (email: string): Promise<Newsletter[]> => {
	try {
		return await db.select().from(newslettersTable).where(eq(newslettersTable.email, email))
	} catch (e) {
		console.error("Unable to get newsletters: ", e);
	}
	return [];
}

export const createNewsletter = async (email: string, cadence: number, name: string): Promise<Newsletter | null> => {
	try {
		return (await db.insert(newslettersTable).values({
			email: email,
			cadence: cadence,
			name: name,
		}).returning())[0];
	} catch (e) {
		console.error("Unable to upsert newsletter: ", e);
	}
	return null;
}

export const updateNewsletter = async (id: string, cadence: number, name: string): Promise<Newsletter | null> => {
	try {
		return (await db.update(newslettersTable).set({
			cadence: cadence,
			name: name,
		}).where(eq(newslettersTable.id, id)).returning())[0];
	} catch (e) {
		console.error("Unable to update newsletter: ", e);
	}
	return null;
}

export const deleteNewsletter = async (id: string): Promise<void> => {
	try {
		await db.delete(newslettersTable).where(eq(newslettersTable.id, id));
	} catch (e) {
		console.error("Unable to delete newsletter: ", e);
	}
}
