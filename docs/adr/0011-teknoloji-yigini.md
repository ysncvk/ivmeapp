# ADR-0011: Teknoloji yığını ve repo yapısı

- **Durum:** Kabul
- **Tarih:** 2026-10-02

## Bağlam

ADR-0001 istemciyi PWA olarak seçti, ADR-0002 çekirdeği kabuktan bağımsız tuttu.
Geliştirme tek kişi tarafından yapılıyor; aynı yığın (Hono, oRPC, Drizzle, Better
Auth, Turborepo, shadcn/ui) başka bir projede üretimde kullanıldı. Yığının
geri kalanı henüz karara bağlanmamıştı.

## Karar

- **Repo:** pnpm + Turborepo monorepo, Node.
- **İstemci:** Vite + React + TanStack Router, **SPA**. Tailwind + shadcn/ui.
- **Sunucu:** Hono + oRPC. Tüm dil TypeScript.
- **Veri:** Postgres + Drizzle. Migration'lar commit'lenir, `db:push` kullanılmaz.
- **Kimlik doğrulama:** Better Auth (bkz. ADR-0012).
- **Yapı:**
  - `apps/web`: tek istemci, dört rol (öğrenci, veli, öğretmen, admin).
  - `apps/server`: HTTP API.
  - `apps/worker`: zamanlanmış işler (sağlayıcı senkronu, haftalık plan).
  - `packages/core`: plan motoru, veri modeli, sağlayıcı arayüzü. DOM, Node ve
    istemci kütüphanesi içermez (ADR-0002).
  - `packages/{api,auth,db,ui,config}`.
- **Tek istemci, roller ile.** Admin ayrı uygulama değil; `web` içinde rol bazlı,
  tembel yüklenen bir rota grubudur.
- **Tüm roller her cihazda tam çalışır.** ADR-0008'deki fark tasarım
  önceliğidir, erişim sınırı değil: öğrenci/veli ekranları mobil öncelikli ama
  masaüstünde de düzgün; öğretmen/admin masaüstü öncelikli ama telefonda da
  kullanılabilir. Her rolün kendi layout'u vardır.

## Gerekçe

- **SPA, SSR değil.** ADR-0001'deki Capacitor planı statik bir build'i sarar;
  sunucu tarafı render eden bir uygulamayı sarmak zordur. Uygulama giriş
  arkasında, SEO ihtiyacı yok. Service worker ve çevrimdışı çalışma SPA'da daha
  basit.
- **Tek istemci.** Ayrı admin uygulaması ikinci bir build, deploy ve bakım hattı
  demek; tek kişilik ekipte en pahalı kalem (ADR-0001 ile aynı mantık). Admin kodu
  ayrı uygulamada durmak onu gizlemez: koruyan şey API yetkilendirmesidir
  (ADR-0010). Admin rotaları tembel yüklenir, öğrenci/veli paketini şişirmez.
- **Worker ayrı süreç.** Gece çalışan sağlayıcı senkronu ve hafta başı plan
  üretimi HTTP isteği ömrüne bağlı olmamalı; hatası API'yi etkilememeli.
- **Migration'lar commit'li.** Şema değişikliği gözden geçirilebilir bir
  artefakt olur. Çocuk verisi tutan bir sistemde "şemayı doğrudan itelim" kabul
  edilebilir değil (ADR-0010).
- **Tanıdık yığın.** Tek kişilik ekipte öğrenme maliyeti sıfıra yakın olması,
  burada başlı başına bir gerekçe.

## Reddedilen alternatifler

**Ayrı admin uygulaması.** Masaüstüne özel arayüz ve ayrı erişim kuralı (ör.
Cloudflare Access ile ayrı alan adı) avantajı var. Ama yolu bazlı koruma (`/admin`)
aynı sonucu verir ve ayrı build/deploy maliyeti yok. Gerekirse admin kodu kendi
klasöründe izole durduğu için sonradan ayrılabilir.

**SSR (React Router framework modu).** Başka projede kullanıldı ve işe yarıyor, ama
Capacitor yolunu ve PWA çevrimdışı çalışmasını zorlaştırır; bu ürün için SSR'ın
getirdiği bir şey yok.

**Bun.** Biraz daha hızlı kurulum ve test sağlar. Ticari sürüm yönetilen bir
ortamda çalışacak (ADR-0010) ve Node orada en az sürprizli seçenek. Hono her
çalışma zamanında çalıştığı için sonradan geçmek kolay; erteleme bedava.

**Mobil için ayrı native uygulama.** ADR-0001'de reddedildi.

## Sonuçlar

- Rol ayrımı istemcide değil API'de yapılır: oRPC middleware'i her çağrıda rolü
  ve çocuk-veli-sınıf ilişkisini kontrol eder (ADR-0010). İstemcide menüyü
  gizlemek yetkilendirme sayılmaz.
- "Tüm roller responsive" bir tasarım şartıdır, her yeni ekran için incelemede
  bakılır.
- Üçüncü taraf sağlayıcı uygulamaları (ADR-0003) ileride kendi paketinde
  (`packages/integrations`) durur; `core` yalnızca arayüzü tutar.
- Gözlemlenebilirlik (hata izleme, erişim kaydı) ayrı bir karar konusudur; ADR-0010
  erişim kaydını zorunlu kılar, aracı belirlemez.
- Ticari sürümün barındırma ortamı ayrıca seçilecek (ADR-0010 madde 7). Prototip
  yerelde `docker-compose` ile çalışır; bu üretim kurulumu değildir.
