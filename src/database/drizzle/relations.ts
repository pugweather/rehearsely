import { relations } from "drizzle-orm/relations";
import { users, scenes, characters, lines } from "./schema";

export const scenesRelations = relations(scenes, ({one}) => ({
	user: one(users, {
		fields: [scenes.user_id],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	scenes: many(scenes),
}));

export const linesRelations = relations(lines, ({one}) => ({
	character: one(characters, {
		fields: [lines.character_id],
		references: [characters.id]
	}),
}));

export const charactersRelations = relations(characters, ({many}) => ({
	lines: many(lines),
}));