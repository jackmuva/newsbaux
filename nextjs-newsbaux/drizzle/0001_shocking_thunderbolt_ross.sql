CREATE TABLE `datasources` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`name` text NOT NULL,
	`standard` integer
);
--> statement-breakpoint
CREATE TABLE `newsSection` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`newsId` text NOT NULL,
	`title` text NOT NULL,
	`systemPrompt` text,
	`dataSources` text,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`newsId`) REFERENCES `newsletters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE ``;