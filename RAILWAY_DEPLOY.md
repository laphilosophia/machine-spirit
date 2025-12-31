# Railway İki Servis Deployment Rehberi

## Yapı

Aynı repo'dan iki ayrı Railway servisi:

- **Servitor**: Backend API (Express + SQLite)
- **Altar**: Frontend (Next.js)

## Railway Kurulumu

### 1. Servitor Servisi

1. Railway'de "New Service" → "GitHub Repo" → `machine-spirit`
2. **Settings**:
   - **Root Directory**: `/` (boş bırak)
   - **Dockerfile Path**: `Dockerfile.servitor`
3. **Variables**:
   - `PORT`: Railway otomatik sağlar
   - `DB_PATH`: `/data/soul.db`
4. **Volume**: `/data` dizinine mount et (SQLite persistence)

### 2. Altar Servisi

1. Railway'de "New Service" → "GitHub Repo" → `machine-spirit`
2. **Settings**:
   - **Root Directory**: `/` (boş bırak)
   - **Dockerfile Path**: `Dockerfile.altar`
3. **Variables**:
   - `NEXT_PUBLIC_API_URL`: Servitor'un Railway URL'si (örn: `https://machine-spirit-servitor.up.railway.app`)

## Bağlantı

Servitor deploy edildikten sonra URL'sini kopyala ve Altar'ın `NEXT_PUBLIC_API_URL` değişkenine yapıştır.

## Test

1. Servitor: `https://[servitor-url]/state` → JSON döner
2. Altar: `https://[altar-url]` → Web arayüzü açılır
