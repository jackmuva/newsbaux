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
CREATE TABLE `editionsSection` (
	`id` text PRIMARY KEY NOT NULL,
	`editionId` text NOT NULL,
	`newsSectionid` text NOT NULL,
	`contents` text,
	`publishDate` text,
	FOREIGN KEY (`editionId`) REFERENCES `editions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`newsSectionid`) REFERENCES `newsSection`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `editions` (
	`id` text PRIMARY KEY NOT NULL,
	`newsletterId` text NOT NULL,
	`contents` text,
	`publishDate` text,
	FOREIGN KEY (`newsletterId`) REFERENCES `newsletters`(`id`) ON UPDATE no action ON DELETE cascade
);
