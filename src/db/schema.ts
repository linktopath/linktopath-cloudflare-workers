import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const shortcutsTable = sqliteTable("shortcuts", {
  id: text().primaryKey().$defaultFn(crypto.randomUUID),
  source_url: text({ mode: "text" }).notNull(),
  slug: text({ mode: "text" }).notNull(),
  expiry_date: text().notNull(),
});
