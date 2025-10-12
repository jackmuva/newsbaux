CREATE TABLE `articles` (
	`id` text PRIMARY KEY NOT NULL,
	`dataSourceId` text NOT NULL,
	`contents` text NOT NULL,
	`url` text NOT NULL,
	`retrievalDate` text,
	`summary` text,
	FOREIGN KEY (`dataSourceId`) REFERENCES `datasources`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `datasources` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`url` text NOT NULL,
	`name` text NOT NULL,
	`standard` integer,
	FOREIGN KEY (`email`) REFERENCES `users`(`email`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `editionsSection` (
	`id` text PRIMARY KEY NOT NULL,
	`editionId` text NOT NULL,
	`newsSectionId` text NOT NULL,
	`contents` text,
	`publishDate` text,
	FOREIGN KEY (`editionId`) REFERENCES `editions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`newsSectionId`) REFERENCES `newsSection`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `editions` (
	`id` text PRIMARY KEY NOT NULL,
	`newsletterId` text NOT NULL,
	`contents` text,
	`publishDate` text,
	FOREIGN KEY (`newsletterId`) REFERENCES `newsletters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `newsSection` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`newsId` text NOT NULL,
	`title` text NOT NULL,
	`systemPrompt` text,
	`dataSources` text,
	FOREIGN KEY (`email`) REFERENCES `users`(`email`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`newsId`) REFERENCES `newsletters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `newsletters` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`cadence` integer,
	`updatedAt` text,
	FOREIGN KEY (`email`) REFERENCES `users`(`email`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`email` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`avatar` text
);
