import { pgTable, varchar, timestamp, text, integer, uniqueIndex, serial } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	name: text(),
});