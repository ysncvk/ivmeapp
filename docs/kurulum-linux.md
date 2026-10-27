# Evde kurulum (Linux + Cloudflare Tunnel)

`docs/kurulum-ev.md`'nin Linux (Debian/Ubuntu) karşılığı. Mimari aynı: tek süreç hem API'yi hem
derlenmiş web arayüzünü `localhost:3000`'de sunar, Cloudflare Tunnel bunu HTTPS ile internete açar
(PWA ve oturum çerezleri HTTPS ister). Router'da port açılmaz. Linux makinede Claude Code'a şunu
söyleyebilirsin: **"docs/kurulum-linux.md dosyasındaki adımları sırayla uygula; her adımdan sonra
çalıştığını doğrula."**

Başka dağıtım (Fedora, Arch) kullanıyorsan yalnızca paket komutları değişir.

## 0. Ön bilgiler (Claude sana soracak)
- Cloudflare'de yönettiğin bir alan adı ve tünelin dış adresi, örn. `https://ivme.alanadin.com` →
  aşağıda `PUBLIC_URL`. (Alan adın yoksa tünel için bir tane gerekir.)
- Makinede `sudo` yetkisi.

## 1. Araçlar
```bash
sudo apt update
sudo apt install -y git curl ca-certificates postgresql postgresql-client
# Node 22 (NodeSource) ve pnpm
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo corepack enable && corepack prepare pnpm@10.28.0 --activate
# cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
```
Kontrol: `node -v` (22.x), `pnpm -v` (10.x), `psql --version`.

## 2. Uygulama kullanıcısı ve kod
Uygulamayı root olarak değil, ayrı bir kullanıcıyla çalıştır:
```bash
sudo adduser --disabled-password --gecos "" ivme
sudo -iu ivme
git clone <repo-adresi> ~/ivmeapp && cd ~/ivmeapp
git checkout claude/keen-clarke-sgusrp     # main'e birleştirildiyse main
pnpm install
```
Bundan sonraki komutlar (aksi söylenmedikçe) `ivme` kullanıcısıyla çalışır.

## 3. Veritabanı
```bash
DB_PASS=$(openssl rand -hex 16); echo "$DB_PASS"    # bir yere not et, 4. adımda lazım
sudo -u postgres psql -c "CREATE ROLE ivme LOGIN PASSWORD '$DB_PASS';"
sudo -u postgres createdb -O ivme ivmeapp
```
Postgres'i dışarıdan erişime AÇMA (`listen_addresses` varsayılan `localhost` kalsın).

## 4. Ortam dosyaları
`apps/server/.env` (git'e girmez):
```
DATABASE_URL=postgres://ivme:<DB_PASS>@localhost:5432/ivmeapp
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
`BETTER_AUTH_SECRET` değerini `.env.example`'daki örnekten KOPYALAMA, kendin üret.

`apps/server/.env` dosyasının izinlerini daralt: `chmod 600 apps/server/.env`.

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
Başka bir terminalde: `curl -I http://localhost:3000/veli` → `200` dönmeli. `Ctrl+C` ile kapat.

## 7. Cloudflare Tunnel
```bash
cloudflared tunnel login
cloudflared tunnel create ivme
cloudflared tunnel route dns ivme ivme.alanadin.com
```
`~/.cloudflared/config.yml`:
```
tunnel: ivme
credentials-file: /home/ivme/.cloudflared/<TÜNEL-ID>.json
ingress:
  - hostname: ivme.alanadin.com
    service: http://localhost:3000
  - service: http_status:404
```
Sistem servisi olarak kur (root ile; yapılandırma `/etc/cloudflared/` altına kopyalanır):
```bash
sudo cloudflared --config /home/ivme/.cloudflared/config.yml service install
sudo systemctl enable --now cloudflared
```
Tarayıcıdan `PUBLIC_URL` açılmalı.

**Erişimi kapat (ADR-0010 madde 5):** Cloudflare Zero Trust panelinde bu adrese bir **Access**
politikası ekle ve yalnızca aile üyelerinin e-postalarına izin ver. Bunu yapmadan adresi kimseyle
paylaşma.

## 8. Makine açılınca otomatik başlasın (systemd)
`/etc/systemd/system/ivme.service` (root ile oluştur):
```ini
[Unit]
Description=Ivme (API + web + worker)
After=network-online.target postgresql.service
Wants=network-online.target

[Service]
User=ivme
WorkingDirectory=/home/ivme/ivmeapp
ExecStart=/bin/bash -lc './scripts/start-prod.sh'
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now ivme
systemctl status ivme
```
Loglar: `journalctl -u ivme -f`. Masaüstü Linux ise uykuya geçişi kapat:
`sudo systemctl mask sleep.target suspend.target hibernate.target`.

## 9. Aile hesapları
1. Eşin `PUBLIC_URL/kayit` → **Veliyim** → rızayı onayla → çocuğu ekle (ad, kullanıcı adı, şifre) → ayarlardan kitapları seç.
2. Sen `PUBLIC_URL/kayit` → **Öğretmenim** → grup aç → davet mesajını eşine gönder → eşin çocuğu gruba ekler.
3. Plan erişimi için (ödeme sağlayıcısı yok) aboneliği elle aç:
   ```bash
   sudo -iu ivme
   cd ~/ivmeapp && set -a; . apps/server/.env; set +a
   pnpm sub:activate <çocuğun-kullanıcı-adı> 12     # 12 ay
   ```
4. Çocuk telefondan `PUBLIC_URL` → **Öğrenci** sekmesi → kullanıcı adı + şifre. iPhone'da
   Safari → Paylaş → "Ana Ekrana Ekle", Android'de Chrome → "Uygulamayı yükle".

## 10. Yedek
```bash
./scripts/backup.sh          # ~/ivme-yedek/ivme-TARIH.sql.gz, son 30 gün
```
Günlük çalışması için `ivme` kullanıcısıyla `crontab -e`: `15 3 * * * cd ~/ivmeapp && ./scripts/backup.sh`.
Geri yükleme: `gunzip -c dosya.sql.gz | psql "$DATABASE_URL"` (önce `.env`'i yükle).
Yedeği makinenin kendi diskinden başka bir yere de kopyala (harici disk, başka makine).

## 11. Güncelleme
```bash
sudo -iu ivme
cd ~/ivmeapp && git pull && pnpm install && pnpm prod:build && (set -a; . apps/server/.env; set +a; pnpm db:migrate)
exit
sudo systemctl restart ivme
```

## Sorun giderme
- **Giriş yapılamıyor / çerez kaydolmuyor:** `BETTER_AUTH_URL` ve `CORS_ORIGIN` tam olarak tarayıcıdaki
  adres (https dahil, sonda `/` yok) olmalı.
- **"Çok fazla deneme":** giriş için 5 dakikada 10 deneme sınırı var; birkaç dakika bekle.
- **Sayfa açılıyor ama veri gelmiyor:** web yanlış adresle derlenmiş olabilir, `apps/web/.env`'i düzeltip `pnpm prod:build`.
- **`systemctl status ivme` hata veriyor:** `journalctl -u ivme -n 50`; çoğunlukla `apps/server/.env`
  eksik ya da `pnpm prod:build` çalışmamıştır.
- **Veritabanına bağlanamıyor:** `.env`'i yükleyip `psql "$DATABASE_URL" -c 'select 1'` ile elle dene
  (şifre yanlış ya da rol yoksa buradan görünür).
