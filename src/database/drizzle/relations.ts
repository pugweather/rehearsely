import { relations } from "drizzle-orm/relations";
import { characters, lines, scenes, usersInAuth, users } from "./schema";

export const linesRelations = relations(lines, ({one}) => ({
	character: one(characters, {
		fields: [lines.character_id],
		references: [characters.id]
	}),
	scene: one(scenes, {
		fields: [lines.scene_id],
		references: [scenes.id]
	}),
}));

export const charactersRelations = relations(characters, ({one, many}) => ({
	lines: many(lines),
	scene: one(scenes, {
		fields: [characters.scene_id],
		references: [scenes.id]
	}),
}));

export const scenesRelations = relations(scenes, ({one, many}) => ({
	lines: many(lines),
	characters: many(characters),
	user: one(users, {
		fields: [scenes.user_id],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	usersInAuth_id: one(usersInAuth, {
		fields: [users.id],
		references: [usersInAuth.id],
		relationName: "users_id_usersInAuth_id"
	}),
	usersInAuth_user_id: one(usersInAuth, {
		fields: [users.user_id],
		references: [usersInAuth.id],
		relationName: "users_user_id_usersInAuth_id"
	}),
	scenes: many(scenes),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	users_id: many(users, {
		relationName: "users_id_usersInAuth_id"
	}),
	users_user_id: many(users, {
		relationName: "users_user_id_usersInAuth_id"
	}),
}));