import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { v4 } from 'uuid';

export const usersTable = sqliteTable('users', {
	id: text('id').primaryKey().$defaultFn(() => v4()),
	name: text('name').notNull(),
	email: text('email').notNull(),
	avatar: text("avatar"),
});

export type User = typeof usersTable.$inferSelect;

export const newslettersTable = sqliteTable('newsletters', {
	id: text('id').primaryKey().$defaultFn(() => v4()),
	userId: text('userId').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
	cadence: integer('cadence'),
	updatedAt: text('updatedAt').$defaultFn(() => (new Date()).toUTCString())
		.$onUpdate(() => (new Date()).toUTCString()),
});

export type Newsletter = typeof newslettersTable.$inferSelect;

export const dataSourcesTable = sqliteTable('datasources', {
	id: text('id').primaryKey().$defaultFn(() => v4()),
	url: text('url').notNull(),
	name: text('name').notNull(),
});

export type DataSource = typeof dataSourcesTable.$inferSelect;

export const newsSectionTable = sqliteTable('newsSection', {
	id: text('id').primaryKey().$defaultFn(() => v4()),
	userId: text('userId').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
	newsId: text('newsId').notNull().references(() => newslettersTable.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	systemPrompt: text('systemPrompt'),
	dataSources: text("dataSources").$type<DataSource[]>(),
});

export type NewsSection = typeof newsSectionTable.$inferSelect;
