import { eq } from 'drizzle-orm';
import { db } from '../connection';
import { DataSource, dataSourcesTable } from '../schema';

export const getStandardDataSources = async (): Promise<DataSource[]> => {
	try {
		return await db.select().from(dataSourcesTable).where(eq(dataSourcesTable.standard, true));
	} catch (e) {
		console.error("unable to get standard data sources: ", e);
	}
	return [];
}

export const getDataSourcesByUser = async (email: string): Promise<DataSource[]> => {
	try {
		return await db.select().from(dataSourcesTable).where(eq(dataSourcesTable.email, email));
	} catch (e) {
		console.error("unable to get standard data sources: ", e);
	}
	return [];
}
export const createDataSource = async (url: string, email: string, name: string, standard: boolean): Promise<DataSource | null> => {
	try {
		return (await db.insert(dataSourcesTable).values({
			url, email, name, standard
		}).returning())[0]
	} catch (e) {
		console.error("Unable to create data source: ", e);
	}
	return null;
}

export const deleteDataSourceById = async (id: string): Promise<void> => {
	try {
		await db.delete(dataSourcesTable).where(eq(dataSourcesTable.id, id));
	} catch (e) {
		console.error("Unable to delete data source: ", e);
	}
}
