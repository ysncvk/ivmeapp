import { account, user } from "@ivmeapp/db/schema/auth";
import {
	createTestDatabase,
	type TestDatabase,
} from "@ivmeapp/db/test-database";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
	type Auth,
	CHILD_EMAIL_DOMAIN,
	createAuth,
	createStudentUser,
	resetStudentPassword,
	validateChildPassword,
	validateUsername,
} from "./index";

let t: TestDatabase;
let auth: Auth;

beforeAll(async () => {
	t = await createTestDatabase("auth");
	auth = createAuth(
		{
			BETTER_AUTH_URL: "http://localhost:3000",
			BETTER_AUTH_SECRET: "test-secret-test-secret-test-secret-123",
			CORS_ORIGIN: "http://localhost:3001",
		},
		t.db,
		{ rateLimit: false },
	);
}, 60_000);
afterAll(async () => {
	await t?.close();
});

const email = () => `${crypto.randomUUID().slice(0, 8)}@example.test`;

describe("kamuya açık kayıt", () => {
	it("varsayılan rol veli", async () => {
		const res = await auth.api.signUpEmail({
			body: { email: email(), password: "Sifre12345", name: "Veli" },
		});
		const [row] = await t.db
			.select()
			.from(user)
			.where(eq(user.id, res.user.id));
		expect(row?.role).toBe("guardian");
	});

	it("öğretmen olarak kayıt olunabilir", async () => {
		const res = await auth.api.signUpEmail({
			body: {
				email: email(),
				password: "Sifre12345",
				name: "Öğretmen",
				role: "teacher",
			},
		});
		const [row] = await t.db
			.select()
			.from(user)
			.where(eq(user.id, res.user.id));
		expect(row?.role).toBe("teacher");
	});

	it("admin ve öğrenci rolüyle kamuya açık kayıt reddedilir", async () => {
		for (const role of ["admin", "student", "root"]) {
			await expect(
				auth.api.signUpEmail({
					body: { email: email(), password: "Sifre12345", name: "X", role },
				}),
			).rejects.toThrow();
		}
	});

	it("oturum açık kullanıcı update-user ile rolünü ya da kullanıcı adını değiştiremez", async () => {
		const addr = email();
		const signUp = await auth.handler(
			new Request("http://localhost:3000/api/auth/sign-up/email", {
				method: "POST",
				headers: {
					"content-type": "application/json",
					origin: "http://localhost:3001",
				},
				body: JSON.stringify({
					email: addr,
					password: "Sifre12345",
					name: "V",
				}),
			}),
		);
		const cookie = signUp.headers
			.getSetCookie()
			.map((c) => c.split(";")[0])
			.join("; ");
		const update = (body: object) =>
			auth.handler(
				new Request("http://localhost:3000/api/auth/update-user", {
					method: "POST",
					headers: {
						"content-type": "application/json",
						origin: "http://localhost:3001",
						cookie,
					},
					body: JSON.stringify(body),
				}),
			);
		expect((await update({ role: "admin" })).status).toBe(400);
		expect((await update({ username: "hileci" })).status).toBe(400);
		const [row] = await t.db.select().from(user).where(eq(user.email, addr));
		expect(row?.role).toBe("guardian");
		// Diğer alanlar (ad) hâlâ güncellenebilir.
		expect((await update({ name: "Yeni Ad" })).status).toBe(200);
	});

	it("kamuya açık kayıtta kullanıcı adı verilemez", async () => {
		await expect(
			auth.api.signUpEmail({
				body: {
					email: email(),
					password: "Sifre12345",
					name: "X",
					username: "hileci",
				},
			}),
		).rejects.toThrow();
	});
});

describe("çocuk hesabı (ADR-0012)", () => {
	it("sunucuda kurulur, kullanıcı adı ve şifreyle giriş yapar", async () => {
		const { userId } = await createStudentUser(auth, {
			name: "Ada",
			username: "Kaplan-4821",
			password: "ada123",
		});
		const [row] = await t.db.select().from(user).where(eq(user.id, userId));
		expect(row?.role).toBe("student");
		expect(row?.username).toBe("kaplan-4821");
		expect(row?.email.endsWith(`@${CHILD_EMAIL_DOMAIN}`)).toBe(true);

		const res = await auth.api.signInUsername({
			body: { username: "kaplan-4821", password: "ada123" },
		});
		expect(res?.user.id).toBe(userId);
		expect((res?.user as { role?: string } | undefined)?.role).toBe("student");
	});

	it("yanlış şifreyle giriş reddedilir; şifre düz metin saklanmaz", async () => {
		const { userId } = await createStudentUser(auth, {
			name: "Mert",
			username: "aslan-1111",
			password: "mert123",
		});
		await expect(
			auth.api.signInUsername({
				body: { username: "aslan-1111", password: "yanlis1" },
			}),
		).rejects.toThrow();
		const [acc] = await t.db
			.select()
			.from(account)
			.where(eq(account.userId, userId));
		expect(acc?.password).toBeTruthy();
		expect(acc?.password).not.toBe("mert123");
	});

	it("kullanıcı adı benzersiz", async () => {
		await createStudentUser(auth, {
			name: "A",
			username: "tilki-2222",
			password: "sifre1",
		});
		await expect(
			createStudentUser(auth, {
				name: "B",
				username: "TILKI-2222",
				password: "sifre2",
			}),
		).rejects.toThrow("alınmış");
	});

	it("şifreyi yalnızca sıfırlama ile değişir; eski şifre geçersiz olur", async () => {
		const { userId } = await createStudentUser(auth, {
			name: "Can",
			username: "kartal-3333",
			password: "eski123",
		});
		await resetStudentPassword(auth, userId, "yeni456");
		await expect(
			auth.api.signInUsername({
				body: { username: "kartal-3333", password: "eski123" },
			}),
		).rejects.toThrow();
		const res = await auth.api.signInUsername({
			body: { username: "kartal-3333", password: "yeni456" },
		});
		expect(res?.user.id).toBe(userId);
	});

	it("çocuk e-posta ile kayıtlı veli gibi oturum açamaz (kamuya açık rol kısıtı)", async () => {
		await expect(
			auth.api.signUpEmail({
				body: {
					email: `x@${CHILD_EMAIL_DOMAIN}`,
					password: "Sifre12345",
					name: "X",
					role: "student",
				},
			}),
		).rejects.toThrow();
	});
});

describe("doğrulayıcılar", () => {
	it("kullanıcı adı biçimi", () => {
		expect(validateUsername("kaplan-4821")).toBeNull();
		expect(validateUsername("Kaplan.48_21")).toBeNull(); // büyük harf küçültülür
		expect(validateUsername("ab")).not.toBeNull();
		expect(validateUsername("boşluk var")).not.toBeNull();
		expect(validateUsername("çğ-ğü")).not.toBeNull();
		expect(validateUsername("-baslangic")).not.toBeNull();
		expect(validateUsername("a".repeat(31))).not.toBeNull();
	});

	it("çocuk şifresi 6-64 karakter", () => {
		expect(validateChildPassword("12345")).not.toBeNull();
		expect(validateChildPassword("123456")).toBeNull();
		expect(validateChildPassword("x".repeat(65))).not.toBeNull();
	});

	it("geçersiz girdiyle hesap kurulmaz", async () => {
		await expect(
			createStudentUser(auth, {
				name: "A",
				username: "x",
				password: "sifre123",
			}),
		).rejects.toThrow(RangeError);
		await expect(
			createStudentUser(auth, {
				name: "A",
				username: "gecerli-ad",
				password: "123",
			}),
		).rejects.toThrow(RangeError);
	});
});
