import { pgTable, foreignKey, unique, bigint, text, smallint, numeric, boolean, uuid, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"


export const lines = pgTable("lines", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "lines_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	text: text(),
	order: smallint().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	character_id: bigint({ mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	scene_id: bigint({ mode: "number" }).notNull(),
	audio_url: text(),
	speed: numeric().notNull(),
	delay: numeric().notNull(),
	is_voice_cloned: boolean().default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.character_id],
			foreignColumns: [characters.id],
			name: "lines_character_id_fkey"
		}),
	foreignKey({
			columns: [table.scene_id],
			foreignColumns: [scenes.id],
			name: "lines_scene_id_fkey"
		}),
	unique("lines_scene_order_key").on(table.scene_id, table.order),
	unique("lines_audio_url_key").on(table.audio_url),
]);

export const characters = pgTable("characters", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "characters_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	name: text().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	scene_id: bigint({ mode: "number" }).notNull(),
	voice_id: text(),
	is_me: boolean().default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.scene_id],
			foreignColumns: [scenes.id],
			name: "characters_scene_id_fkey"
		}),
	unique("characters_id_key").on(table.id),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text(),
	email: text(),
	created_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	user_id: uuid(),
}, (table) => [
	foreignKey({
			columns: [table.id],
			foreignColumns: [table.id],
			name: "users_id_fkey"
		}),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [table.id],
			name: "users_user_id_fkey"
		}),
	unique("users_user_id_key").on(table.user_id),
]);

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
]);
