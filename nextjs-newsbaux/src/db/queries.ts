import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { DataSource, Newsletter, newslettersTable, NewsSection, newsSectionTable, User, usersTable } from './schema';
import { eq } from 'drizzle-orm';

const client = createClient({
	url: process.env.TURSO_URL!,
	authToken: process.env.TURSO_TOKEN
}
);

const db = drizzle({ client });

const getUserByEmail = async (email: string): Promise<User | null> => {
	try {
		return (await db.select().from(usersTable).where(eq(usersTable.email, email)))[0]
	} catch (e) {
		console.error("Unable to get user: ", e);
	}
	return null;
}

const createUser = async (name: string, email: string, avatar: string): Promise<User[]> => {
	try {
		return await db.insert(usersTable).values({
			name, email, avatar
		}).returning();
	} catch (e) {
		console.error("Unable to create user: ", e);
	}
	return [];
}

const getNewslettersByUserId = async (userId: string): Promise<Newsletter[] | null> => {
	try {
		return await db.select().from(newslettersTable).where(eq(newslettersTable.userId, userId))
	} catch (e) {
		console.error("Unable to get newsletters: ", e);
	}
	return null;
}


const createNewsletter = async (userId: string, cadence: number): Promise<Newsletter | null> => {
	try {
		return (await db.insert(newslettersTable).values({
			userId: userId,
			cadence: cadence,
		}).returning())[0];
	} catch (e) {
		console.error("Unable to upsert newsletter: ", e);
	}
	return null;
}

const updateNewsletter = async (id: string, cadence: number): Promise<Newsletter | null> => {
	try {
		return (await db.update(newslettersTable).set({
			cadence: cadence,
		}).where(eq(newslettersTable.id, id)).returning())[0];
	} catch (e) {
		console.error("Unable to update newsletter: ", e);
	}
	return null;
}

const getNewsSectionsByNewsletterId = async (id: string): Promise<NewsSection[]> => {
	try {
		return await db.select().from(newsSectionTable).where(eq(newsSectionTable.id, id));
	} catch (e) {
		console.error("Unable to get sections: ", e);
	}
	return [];
}

const createNewsSection = async (userId: string, newsId: string, title: string, systemPrompt: string | null, dataSources: DataSource[] | null): Promise<NewsSection | null> => {
	try {
		return (await db.insert(newsSectionTable).values({
			userId, newsId, title, systemPrompt, dataSources
		}).returning())[0]
	} catch (e) {
		console.error("Unable to create section: ", e);
	}
	return null;
}

const updateNewsSection = async (id: string, title: string, systemPrompt: string | null, dataSources: DataSource[] | null): Promise<NewsSection | null> => {
	try {
		return (await db.update(newsSectionTable).set({
			title, systemPrompt, dataSources
		}).where(eq(newslettersTable.id, id)).returning())[0]
	} catch (e) {
		console.error("Unable to update section: ", e);
	}
	return null;
}


