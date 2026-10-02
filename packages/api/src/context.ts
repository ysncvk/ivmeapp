import type { Session } from "@ivmeapp/auth";
import type { Database } from "@ivmeapp/db";

export type Context = {
  session: Session | null;
  db: Database;
};
