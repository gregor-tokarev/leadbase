import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia } from "lucia";
import { withLogger } from "vinxi/dist/types/lib/logger";
import { db } from "./db";
import { sessions, users } from "@/schema/auth";
import { webcrypto } from "node:crypto";

globalThis.crypto = webcrypto as Crypto;

const drizzleAdapter = new DrizzlePostgreSQLAdapter(db, sessions, users)
export const lucia = new Lucia(drizzleAdapter)

export type Auth = typeof lucia;
