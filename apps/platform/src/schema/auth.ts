import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id")
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    email: text("email").notNull(),
    verifyedAt: timestamp("verifyed_at"),
    verificationCode: text("verification_code"),
    lastLoginAt: timestamp("last_login_at"),
});

export const sessions = pgTable("sessions", {
    id: text("id").primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull()
})
