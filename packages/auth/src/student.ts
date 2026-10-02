import type { Auth } from "./index";

/** Çocuklara verilen yapay e-posta alanı: çözümlenemez ve gerçek bir adres değildir (K-007). */
export const CHILD_EMAIL_DOMAIN = "cocuk.ivme.invalid";

export const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{2,29}$/;

export function normalizeUsername(value: string): string {
	return value.trim().toLowerCase();
}

/** Kullanıcı adı: 3-30 karakter; küçük harf, rakam, nokta, alt çizgi, tire. */
export function validateUsername(value: string): string | null {
	return USERNAME_RE.test(normalizeUsername(value))
		? null
		: "Kullanıcı adı 3-30 karakter olmalı; yalnızca küçük harf, rakam, nokta, alt çizgi ve tire";
}

/** Çocuk şifresi: 11 yaş için sade (6+ karakter), tahmine karşı oran sınırı ve veli sıfırlaması var. */
export function validateChildPassword(value: string): string | null {
	if (value.length < 6) return "Şifre en az 6 karakter olmalı";
	if (value.length > 64) return "Şifre en fazla 64 karakter olabilir";
	return null;
}

/**
 * ADR-0012: çocuk hesabı sunucuda, e-posta akışı olmadan kurulur. Doğrulamayı burada
 * yapıyoruz çünkü iç bağdaştırıcı kamuya açık uç noktaların doğrulamasını çalıştırmaz.
 */
export async function createStudentUser(
	auth: Auth,
	input: { name: string; username: string; password: string },
): Promise<{ userId: string; username: string }> {
	const username = normalizeUsername(input.username);
	const usernameError = validateUsername(username);
	if (usernameError) throw new RangeError(usernameError);
	const passwordError = validateChildPassword(input.password);
	if (passwordError) throw new RangeError(passwordError);

	const ctx = await auth.$context;
	const existing = await ctx.adapter.findOne({
		model: "user",
		where: [{ field: "username", value: username }],
	});
	if (existing) throw new RangeError("Bu kullanıcı adı alınmış");

	const created = await ctx.internalAdapter.createUser(
		{
			name: input.name,
			email: `${crypto.randomUUID()}@${CHILD_EMAIL_DOMAIN}`,
			emailVerified: true,
			role: "student",
			username,
			displayUsername: username,
		},
		{ method: "admin" },
	);
	await ctx.internalAdapter.linkAccount({
		userId: created.id,
		providerId: "credential",
		accountId: created.id,
		password: await ctx.password.hash(input.password),
	});
	return { userId: created.id, username };
}

/** Çocuğun şifresini yalnızca veli sıfırlar (e-posta olmadığı için başka yol yok, ADR-0012). */
export async function resetStudentPassword(
	auth: Auth,
	userId: string,
	newPassword: string,
): Promise<void> {
	const error = validateChildPassword(newPassword);
	if (error) throw new RangeError(error);
	const ctx = await auth.$context;
	await ctx.internalAdapter.updatePassword(
		userId,
		await ctx.password.hash(newPassword),
	);
}
