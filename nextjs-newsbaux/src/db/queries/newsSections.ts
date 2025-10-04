import { eq } from 'drizzle-orm';
import { db } from '../connection';
import { DataSource, NewsSection, newsSectionTable } from '../schema';

export const getNewsSectionsByNewsletterId = async (id: string): Promise<NewsSection[]> => {
	try {
		return await db.select().from(newsSectionTable).where(eq(newsSectionTable.newsId, id));
	} catch (e) {
		console.error("Unable to get sections: ", e);
	}
	return [];
}

export const createNewsSection = async (userId: string, newsId: string, title: string, systemPrompt: string | null, dataSources: DataSource[] | null): Promise<NewsSection | null> => {
	try {
		return (await db.insert(newsSectionTable).values({
			userId, newsId, title, systemPrompt, dataSources
		}).returning())[0]
	} catch (e) {
		console.error("Unable to create section: ", e);
	}
	return null;
}

export const updateNewsSection = async (id: string, title: string, systemPrompt: string | null, dataSources: DataSource[] | null): Promise<NewsSection | null> => {
	try {
		return (await db.update(newsSectionTable).set({
			title, systemPrompt, dataSources
		}).where(eq(newsSectionTable.id, id)).returning())[0]
	} catch (e) {
		console.error("Unable to update section: ", e);
	}
	return null;
}

export const deleteNewsSection = async (id: string): Promise<void> => {
	try {
		await db.delete(newsSectionTable).where(eq(newsSectionTable.id, id));
	} catch (e) {
		console.error("unable to delete section: ", e);
	}
}
