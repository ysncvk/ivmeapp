# İvme

6. sınıf öğrencileri için günlük soru hedefi, çalışma planı ve ödev takibi (PWA). Veli ders başına günlük
soru hedefi koyar (ücretsiz); ücretli koçluk bu hedefi seçilen kitaplardan "bugün şu testleri çöz"
önerisine çevirir. Öğretmen çalışma grubuna ödev verir; öğrenci günün sorularını ve testlerini işaretler;
veli haftalık özet, gidişat ve deneme raporlarını görür. Kararlar `docs/adr/` altındaki ADR'lerde, otonom alınan ayrıntı kararlar
`docs/karar-gunlugu.md` içinde, eksik veri ve açık sorular `docs/eksikler.md` içindedir.

## Yapı

| Yol | İçerik |
| --- | --- |
| `apps/web` | Vite + React + TanStack Router PWA (öğrenci, veli, öğretmen ekranları) |
| `apps/server` | Hono + oRPC + Better Auth sunucusu |
| `apps/worker` | Zamanlanmış işler (Pazar akşamı plan üretimi, saklama süresi temizliği) |
| `packages/core` | Saf, deterministik plan motoru, ödül, giriş hakkı (entitlement), deneme analizi |
| `packages/library` | Kitap içerikleri ve müfredat verisi (kodda, K-008) + dev-time içe aktarma betikleri |
| `packages/api` | oRPC yönlendiricileri, yetkilendirme (ADR-0010) ve servisler |
| `packages/auth` | Better Auth yapılandırması, çocuk hesabı (kullanıcı adı + şifre) |
| `packages/db` | Drizzle şeması, migration'lar, test veritabanı yardımcıları |

## Geliştirme

```bash
pnpm install
docker compose up -d postgres        # ya da: scripts/test-pg.sh start  (Docker'sız geçici Postgres)
cp apps/server/.env.example apps/server/.env   # DATABASE_URL, BETTER_AUTH_SECRET, ...
pnpm db:migrate
pnpm db:seed                          # örnek veli / öğretmen / öğrenci
pnpm dev                              # web :3001, server :3000
```

Seed hesapları: `veli@ivme.test` ve `ogretmen@ivme.test` (şifre `Sifre12345`), öğrenci
kullanıcı adı `deniz` / `123456`.

Tasarım önizlemeleri (giriş gerektirmez, yalnızca dev): `/onizleme/ogrenci`, `/onizleme/veli`.

## Test ve kalite kapıları

```bash
scripts/test-pg.sh start   # entegrasyon testleri gerçek Postgres kullanır (K-012)
pnpm exec biome check .
pnpm check-types
pnpm test
```

CI (`.github/workflows/ci.yml`) aynı üç kapıyı Postgres servis konteyneriyle çalıştırır.

## Kurulum

- Evde Linux (systemd + Cloudflare Tunnel): `docs/kurulum-linux.md`
- Evde macOS (launchd + Cloudflare Tunnel): `docs/kurulum-ev.md`
- Bulutta deneme (Render + Neon, ücretsiz katman, yalnızca sahte veri): `docs/kurulum-bulut.md`

## Ortam değişkenleri

`apps/server`: `DATABASE_URL`, `BETTER_AUTH_SECRET` (en az 32 karakter), `BETTER_AUTH_URL`,
`CORS_ORIGIN`. `apps/web`: `VITE_SERVER_URL`. `apps/worker`: `DATABASE_URL`.
Testler: `TEST_DATABASE_URL` (taban adres; paket başına ayrı veritabanı açılır).
