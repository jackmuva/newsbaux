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

export const createNewsSection = async (email: string, newsId: string, title: string, systemPrompt: string | null, dataSources: DataSource[] | null): Promise<NewsSection | null> => {
	console.log("sources: ", dataSources);
	try {
		return (await db.insert(newsSectionTable).values({
			email: email,
			newsId: newsId,
			title: title,
			systemPrompt: systemPrompt,
			dataSources: dataSources,
		}).returning())[0]
	} catch (e) {
		console.error("Unable to create section: ", e);
	}
	return null;
}

export const upsertNewsSection = async (id: string, email: string, newsId: string, title: string, systemPrompt: string | null, dataSources: DataSource[] | null): Promise<NewsSection | null> => {
	try {
		const existing: boolean = (await db.select().from(newsSectionTable)
			.where(eq(newsSectionTable.id, id))).length > 0;
		if (existing) {
			return (await db.update(newsSectionTable).set({
				title, systemPrompt, dataSources
			}).where(eq(newsSectionTable.id, id)).returning())[0]
		} else {
			return (await db.insert(newsSectionTable).values({
				email: email,
				newsId: newsId,
				title: title,
				systemPrompt: systemPrompt,
				dataSources: dataSources,
			}).returning())[0]
		}
	} catch (e) {
		console.error("Unable to update section: ", e);
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
