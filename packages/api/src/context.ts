import type { Auth, Session } from "@ivmeapp/auth";
import type { Database } from "@ivmeapp/db";

export type Context = {
	session: Session | null;
	db: Database;
	auth: Auth;
	/** Saat kaynağı; testlerde sabitlenir. */
	now?: () => Date;
};

export const clock = (context: Pick<Context, "now">): Date =>
	context.now?.() ?? new Date();
