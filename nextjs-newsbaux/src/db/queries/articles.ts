import { eq } from 'drizzle-orm';
import { db } from '../connection';
import { Article, articlesTable } from '../schema';

export const getArticlesByDataSourceId = async (dataSourceId: string): Promise<Article[]> => {
	try {
		return await db.select().from(articlesTable).where(eq(articlesTable.dataSourceId, dataSourceId));
	} catch (e) {
		console.error("Unable to get articles: ", e);
	}
	return [];
}

export const createArticle = async (dataSourceId: string, title: string, contents: string, url: string, summary?: string): Promise<Article | null> => {
	try {
		return (await db.insert(articlesTable).values({
			dataSourceId, title, contents, url, summary
		}).returning())[0];
	} catch (e) {
		console.error("Unable to create article: ", e);
	}
	return null;
}

export const updateArticle = async (id: string, contents: string, summary?: string): Promise<Article | null> => {
	try {
		return (await db.update(articlesTable).set({
			contents, summary
		}).where(eq(articlesTable.id, id)).returning())[0];
	} catch (e) {
		console.error("Unable to update article: ", e);
	}
	return null;
}

export const deleteArticle = async (id: string): Promise<void> => {
	try {
		await db.delete(articlesTable).where(eq(articlesTable.id, id));
	} catch (e) {
		console.error("Unable to delete article: ", e);
	}
}
