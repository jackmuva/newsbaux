import { eq } from 'drizzle-orm';
import { db } from '../connection';
import { User, usersTable } from '../schema';

export const getUserByEmail = async (email: string): Promise<User | null> => {
	try {
		return (await db.select().from(usersTable).where(eq(usersTable.email, email)))[0]
	} catch (e) {
		console.error("Unable to get user: ", e);
	}
	return null;
}

export const createUser = async (name: string, email: string, avatar: string): Promise<User[]> => {
	try {
		return await db.insert(usersTable).values({
			name, email, avatar
		}).returning();
	} catch (e) {
		console.error("Unable to create user: ", e);
	}
	return [];
}

export const deleteUser = async (id: string): Promise<void> => {
	try {
		await db.delete(usersTable).where(eq(usersTable.id, id));
	} catch (e) {
		console.error("Unable to delete user: ", e);
	}
}
