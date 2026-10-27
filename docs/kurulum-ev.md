# Evde kurulum (macOS + Cloudflare Tunnel)

Bu belge, İvme'yi evdeki bir Mac'e kurmak içindir. Linux için: `docs/kurulum-linux.md`. Mac'te Claude Code'a şunu söyleyebilirsin:
**"docs/kurulum-ev.md dosyasındaki adımları sırayla uygula; her adımdan sonra çalıştığını doğrula."**

Mimari: tek süreç hem API'yi hem derlenmiş web arayüzünü sunar (`localhost:3000`). Cloudflare
Tunnel bu adresi internete HTTPS ile açar. PWA yüklemek ve oturum çerezleri HTTPS ister; tünel
bunu sağlar. Veritabanı aynı Mac'te çalışan Postgres'tir. Worker (Pazar akşamı plan üretimi)
aynı betikle birlikte başlar.

## 0. Ön bilgiler (Claude sana soracak)
- Tünelin dış adresi, örn. `https://ivme.alanadin.com` → aşağıda `PUBLIC_URL`.
- Tünel zaten varsa adı ve yapılandırma dosyası (`~/.cloudflared/config.yml` ya da Zero Trust panelinden yönetilen).

## 1. Araçlar
```bash
brew install node@22 pnpm postgresql@16 cloudflared git
brew services start postgresql@16
```

## 2. Kodu al
```bash
git clone <repo-adresi> ~/ivmeapp && cd ~/ivmeapp
git checkout claude/keen-clarke-sgusrp     # ya da main, birleştirildiyse
pnpm install
```

## 3. Veritabanı
```bash
createuser ivme
createdb -O ivme ivmeapp
```
Yerel Postgres'e şifresiz yerel bağlantı yeterli (`postgres://ivme@localhost:5432/ivmeapp`).
Dışarıdan erişime AÇMA; yalnızca bu Mac kullanır.

## 4. Ortam dosyaları
`apps/server/.env` (git'e girmez):
```
DATABASE_URL=postgres://ivme@localhost:5432/ivmeapp
BETTER_AUTH_SECRET=<openssl rand -hex 32 çıktısı>
BETTER_AUTH_URL=<PUBLIC_URL>
CORS_ORIGIN=<PUBLIC_URL>
PORT=3000
```
`apps/web/.env`:
```
VITE_SERVER_URL=<PUBLIC_URL>
```
Web adresi derleme anında gömülür; `PUBLIC_URL` değişirse `pnpm prod:build` yeniden çalışmalı.

## 5. Derle ve veritabanını kur
```bash
pnpm prod:build
set -a; . apps/server/.env; set +a    # DATABASE_URL'i bu terminale yükle
pnpm db:migrate
```

## 6. Çalıştır ve dene
```bash
pnpm prod:start
```
Başka bir terminalde: `curl -I http://localhost:3000/veli` → `200` dönmeli.

## 7. Cloudflare Tunnel
Tünel zaten tanımlıysa, ingress kuralına şunu ekle (panelden ya da `config.yml`):
```
- hostname: ivme.alanadin.com
  service: http://localhost:3000
```
Tünel yoksa: `cloudflared tunnel login` → `cloudflared tunnel create ivme` →
`cloudflared tunnel route dns ivme ivme.alanadin.com` → yukarıdaki ingress ile `config.yml` →
`sudo cloudflared service install`. Sonra tarayıcıdan `PUBLIC_URL` açılmalı.

## 8. Mac açılınca otomatik başlasın (launchd)
`~/Library/LaunchAgents/com.ivme.app.plist` (yolları kendi kullanıcınla değiştir):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.ivme.app</string>
  <key>ProgramArguments</key><array>
    <string>/bin/bash</string><string>-lc</string>
    <string>cd ~/ivmeapp && ./scripts/start-prod.sh</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>/tmp/ivme.log</string>
  <key>StandardErrorPath</key><string>/tmp/ivme.err</string>
</dict></plist>
```
```bash
launchctl load ~/Library/LaunchAgents/com.ivme.app.plist
```
Mac uyku moduna girerse site kapanır: Sistem Ayarları → Enerji → "Ekran kapalıyken uyumayı engelle"
(ya da `sudo pmset -a sleep 0`).

## 9. Aile hesapları
1. Eşin `PUBLIC_URL/kayit` → **Veliyim** → rızayı onayla → çocuğu ekle (ad, kullanıcı adı, şifre) → ayarlardan kitapları seç.
2. Sen `PUBLIC_URL/kayit` → **Öğretmenim** → grup aç → davet mesajını eşine gönder → eşin çocuğu gruba ekler.
3. Plan erişimi için (ödeme sağlayıcısı yok) aboneliği elle aç:
   ```bash
   pnpm sub:activate <çocuğun-kullanıcı-adı> 12     # 12 ay
   ```
4. Çocuk telefondan `PUBLIC_URL` → **Öğrenci** sekmesi → kullanıcı adı + şifre. Safari'de
   Paylaş → "Ana Ekrana Ekle" ile uygulama gibi yüklenir.

## 10. Yedek
```bash
./scripts/backup.sh          # ~/ivme-yedek/ivme-TARIH.sql.gz, son 30 gün
```
Günlük çalışması için `crontab -e`: `15 3 * * * cd ~/ivmeapp && ./scripts/backup.sh`.
Geri yükleme: `gunzip -c dosya.sql.gz | psql postgres://ivme@localhost:5432/ivmeapp`.
Yedeği Mac'in kendi diskinden başka bir yere de kopyala (harici disk / iCloud).

## 11. Güncelleme
```bash
cd ~/ivmeapp && git pull && pnpm install && pnpm prod:build && (set -a; . apps/server/.env; set +a; pnpm db:migrate)
launchctl kickstart -k gui/$(id -u)/com.ivme.app
```

## Sorun giderme
- **Giriş yapılamıyor / çerez kaydolmuyor:** `BETTER_AUTH_URL` ve `CORS_ORIGIN` tam olarak tarayıcıdaki
  adres (https dahil, sonda `/` yok) olmalı.
- **"Çok fazla deneme":** giriş için 5 dakikada 10 deneme sınırı var; birkaç dakika bekle.
- **Sayfa açılıyor ama veri gelmiyor:** web yanlış adresle derlenmiş olabilir, `apps/web/.env`'i düzeltip `pnpm prod:build`.
- **Loglar:** `/tmp/ivme.log`, `/tmp/ivme.err`.
