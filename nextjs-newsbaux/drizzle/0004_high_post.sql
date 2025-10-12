ALTER TABLE `datasources` RENAME COLUMN "userId" TO "email";--> statement-breakpoint
ALTER TABLE `newsSection` RENAME COLUMN "userId" TO "email";--> statement-breakpoint
ALTER TABLE `newsletters` RENAME COLUMN "userId" TO "email";--> statement-breakpoint
ALTER TABLE `datasources` ALTER COLUMN "email" TO "email" text REFERENCES users(email) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `newsSection` ALTER COLUMN "email" TO "email" text NOT NULL REFERENCES users(email) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `newsletters` ALTER COLUMN "email" TO "email" text NOT NULL REFERENCES users(email) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`email` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`avatar` text
);
--> statement-breakpoint
INSERT INTO `__new_users`("email", "name", "avatar") SELECT "email", "name", "avatar" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;