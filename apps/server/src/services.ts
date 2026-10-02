import { createAuth } from "@ivmeapp/auth";
import { createDb } from "@ivmeapp/db";

import { ENV } from "./env.server";

export const db = createDb(ENV);
export const auth = createAuth(ENV, db);
