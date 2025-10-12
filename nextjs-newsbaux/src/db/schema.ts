import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { v4 } from 'uuid';

export const usersTable = sqliteTable('users', {
	email: text('email').primaryKey().notNull(),
	name: text('name').notNull(),
	avatar: text("avatar"),
});

export type User = typeof usersTable.$inferSelect;

export const newslettersTable = sqliteTable('newsletters', {
	id: text('id').primaryKey().$defaultFn(() => v4()),
	email: text('email').notNull().references(() => usersTable.email, { onDelete: 'cascade' }),
	cadence: integer('cadence'),
	updatedAt: text('updatedAt').$defaultFn(() => (new Date()).toUTCString())
		.$onUpdate(() => (new Date()).toUTCString()),
});

export type Newsletter = typeof newslettersTable.$inferSelect;

export const dataSourcesTable = sqliteTable('datasources', {
	id: text('id').primaryKey().$defaultFn(() => v4()),
	email: text('email').references(() => usersTable.email, { onDelete: 'cascade' }),
	url: text('url').notNull(),
	name: text('name').notNull(),
	standard: integer('standard', { mode: "boolean" }).$defaultFn(() => false),
});

export type DataSource = typeof dataSourcesTable.$inferSelect;

export const newsSectionTable = sqliteTable('newsSection', {
	id: text('id').primaryKey().$defaultFn(() => v4()),
	email: text('email').notNull().references(() => usersTable.email, { onDelete: 'cascade' }),
	newsId: text('newsId').notNull().references(() => newslettersTable.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	systemPrompt: text('systemPrompt'),
	dataSources: text("dataSources").$type<DataSource[]>(),
});

export type NewsSection = typeof newsSectionTable.$inferSelect;

export const articlesTable = sqliteTable('articles', {
	id: text('id').primaryKey().$defaultFn(() => v4()),
	dataSourceId: text('dataSourceId').notNull().references(() => dataSourcesTable.id, { onDelete: 'cascade' }),
	contents: text('contents').notNull(),
	url: text('url').notNull(),
	retrievalDate: text('retrievalDate').$defaultFn(() => (new Date()).toUTCString())
		.$onUpdate(() => (new Date()).toUTCString()),
	summary: text('summary'),
});

export type Article = typeof articlesTable.$inferSelect;

export const editionsTable = sqliteTable('editions', {
	id: text('id').primaryKey().$defaultFn(() => v4()),
	newsletterId: text('newsletterId').notNull().references(() => newslettersTable.id, { onDelete: "cascade" }),
	contents: text('contents'),
	publishDate: text('publishDate').$defaultFn(() => (new Date()).toUTCString())
		.$onUpdate(() => (new Date()).toUTCString()),
});

export type Edition = typeof editionsTable.$inferSelect;

export const editionSectionTable = sqliteTable('editionsSection', {
	id: text('id').primaryKey().$defaultFn(() => v4()),
	editionId: text('editionId').notNull().references(() => editionsTable.id, { onDelete: "cascade" }),
	newsSectionId: text('newsSectionid').notNull().references(() => newsSectionTable.id, { onDelete: 'cascade' }),
	contents: text('contents'),
	publishDate: text('publishDate').$defaultFn(() => (new Date()).toUTCString())
		.$onUpdate(() => (new Date()).toUTCString()),
});

export type EditionSection = typeof editionSectionTable.$inferSelect;
