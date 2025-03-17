import { pgTable, unique, bigint, text, uuid, timestamp, foreignKey, smallint } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const characters = pgTable("characters", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "characters_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	name: text().notNull(),
}, (table) => [
	unique("characters_id_key").on(table.id),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text(),
	email: text().notNull(),
	created_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const scenes = pgTable("scenes", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "scenes_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	name: text(),
	modified_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	user_id: uuid().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "scenes_user_id_fkey"
		}),
	unique("scenes_id_key").on(table.id),
	unique("scenes_user_id_key").on(table.user_id),
]);

export const lines = pgTable("lines", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "lines_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	text: text(),
	order: smallint().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	character_id: bigint({ mode: "number" }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.character_id],
			foreignColumns: [characters.id],
			name: "lines_character_id_fkey"
		}),
	unique("lines_order_key").on(table.order),
	unique("lines_character_id_key").on(table.character_id),
]);
