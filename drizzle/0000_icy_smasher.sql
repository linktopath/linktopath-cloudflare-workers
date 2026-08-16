CREATE TABLE `shortcuts` (
	`id` text PRIMARY KEY NOT NULL,
	`source_url` text NOT NULL,
	`slug` text NOT NULL,
	`expiry_date` text NOT NULL
);
