import { db } from "@/libs/db";
import { users } from "@/schema/auth";
import { eq, InferInsertModel, InferSelectModel } from "drizzle-orm";

export async function getUserByEmail(
  email: string,
): Promise<InferSelectModel<typeof users> | undefined> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .execute();

  return user;
}

export async function setUser(
  email: string,
  updateUser: Partial<InferInsertModel<typeof users>>,
): Promise<InferSelectModel<typeof users> | undefined> {
  const user = await getUserByEmail(email);
  if (!user) return undefined;

  const [newUser] = await db
    .update(users)
    .set(updateUser)
    .where(eq(users.email, email))
    .returning()
    .execute();
  return newUser;
}
