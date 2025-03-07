import { pgTable, varchar, timestamp, text, integer, uniqueIndex, serial } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const User = pgTable("User", {
	id: serial().primaryKey().notNull(),
	email: text().notNull(),
	name: text(),
}, (table) => [
	uniqueIndex("User_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")),
]);


/*
export const _prisma_migrations = pgTable("_prisma_migrations", {
	id: varchar({ length: 36 }).primaryKey().notNull(),
	checksum: varchar({ length: 64 }).notNull(),
	finished_at: timestamp({ withTimezone: true, mode: 'string' }),
	migration_name: varchar({ length: 255 }).notNull(),
	logs: text(),
	rolled_back_at: timestamp({ withTimezone: true, mode: 'string' }),
	started_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	applied_steps_count: integer().default(0).notNull(),
});
*/