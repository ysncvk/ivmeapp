/**
 * Entegrasyon testleri için paket başına ayrı veritabanı.
 * TEST_DATABASE_URL bir "taban" adresidir; her paket <taban>_<paket>_<checkout> adlı kendi
 * veritabanını açar, bırakıp commit'li migration'lardan yeniden kurar. Checkout eki, iki
 * çalışma kopyasının birbirinin veritabanını silmesini önler.
 */
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

import { createDb, type Database } from "./index";

const MIGRATIONS = fileURLToPath(new URL("./migrations", import.meta.url));

export const DEFAULT_TEST_URL = "postgres://ivme@localhost:5544/postgres";

export interface TestDatabase {
	db: Database;
	url: string;
	name: string;
	close: () => Promise<void>;
}

function safeName(suite: string): string {
	const checkout = createHash("sha1")
		.update(process.cwd())
		.digest("hex")
		.slice(0, 6);
	return `ivme_test_${suite.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${checkout}`;
}

export async function createTestDatabase(suite: string): Promise<TestDatabase> {
	const base = new URL(process.env.TEST_DATABASE_URL ?? DEFAULT_TEST_URL);
	const name = safeName(suite);

	const admin = new pg.Client({ connectionString: base.toString() });
	await admin.connect();
	try {
		await admin.query(`drop database if exists "${name}" with (force)`);
		await admin.query(`create database "${name}"`);
	} finally {
		await admin.end();
	}

	const target = new URL(base.toString());
	target.pathname = `/${name}`;
	const url = target.toString();
	const db = createDb({ DATABASE_URL: url });
	await migrate(db, { migrationsFolder: MIGRATIONS });

	return {
		db,
		url,
		name,
		close: async () => {
			await db.$client.end();
		},
	};
}
