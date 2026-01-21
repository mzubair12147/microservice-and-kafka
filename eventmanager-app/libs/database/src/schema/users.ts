import { uuid } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";
import { varchar } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";


// enums for users
export const roleEnum = pgEnum("role", ["USER", "ORGANIZER", "ADMIN"]);

// Users tables
export const users = pgTable("users", {
    id: uuid("id").defaultRandom().notNull(),
    email: varchar("email", {length: 255}).notNull().unique(),
    name: varchar("name" , {length: 255}).notNull(),
    password: varchar("password", {length: 255}).notNull(),
    role: roleEnum("role").default("USER").notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
})

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;