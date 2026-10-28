# Deploy N1 CAD Cloud (เฟส 4)

## สถาปัตยกรรม production

```
[Browser] → GitHub Pages (apps/web static)
                ↓ VITE_API_BASE
         Railway / Fly / VPS (apps/api + dwgdxf + cache)
                ↓
         Google Drive (โฟลเดอร์แผนผัง)
```

## 1) API บน Railway (แนะนำ)

1. สร้างโปรเจกต์ที่ [railway.app](https://railway.app) แล้วเชื่อม repo `n1-cad-cloud`
2. Root directory: `apps/api`
3. ใช้ Dockerfile ที่อยู่ใน `apps/api`
4. Variables:

| Key | ค่า |
|-----|-----|
| `GOOGLE_API_KEY` | API key ของ Google Cloud (เปิด Drive API) |
| `DEFAULT_FOLDER_ID` | `1mP47qarQZxPF-ln5Dy7VZrJlcq0uPJ4D` |
| `CONVERT_CONCURRENCY` | `1` |
| `CONVERT_QUEUE_MAX` | `8` |
| `CORS_ORIGIN` | URL เว็บ เช่น `https://fabegasfang-maker.github.io` |
| `CACHE_DIR` | `/data/cache` (มีใน Dockerfile แล้ว) |

5. เพิ่ม Volume mount ไปที่ `/data/cache` ถ้าต้องการแคชคงอยู่หลัง restart
6. คัดลอก Public URL ของ service เช่น `https://n1-cad-cloud-api.up.railway.app`

ตรวจ:

```bash
curl -s https://YOUR-API/api/health
```

ควรเห็น `"phase": 4` และ `queue`

### แรม

แนะนำ **≥ 1–2 GB** ตอนแปลง DWG ใหญ่ ถ้า OOM ให้ลด concurrency = 1 และใช้แคชให้ดี

## 2) Web บน GitHub Pages

1. Repo **Settings → Pages → Source: GitHub Actions**
2. **Settings → Secrets and variables → Actions** เพิ่ม:

| Secret | ค่า |
|--------|-----|
| `VITE_API_BASE` | `https://YOUR-API` (ไม่มี `/` ท้าย) |
| `VITE_DEFAULT_FOLDER_ID` | (optional) folder id |

3. Push ไป `main` หรือรัน workflow **Deploy web to GitHub Pages** มือ

4. เปิด URL ประมาณ:
   `https://fabegasfang-maker.github.io/n1-cad-cloud/`

> ถ้า base path ต้องเป็น subpath ให้ตั้ง `base: '/n1-cad-cloud/'` ใน `apps/web/vite.config.js`

## 3) ตรวจคิวแปลง

```bash
curl -s https://YOUR-API/api/health | jq .queue
# { "active": 0, "waiting": 0, "maxConcurrent": 1, "maxQueue": 8 }
```

ถ้าได้ `503 queue_full` แสดงว่ามีคนขอแปลงพร้อมกันเกินคิว — รอแล้วกดโหลดใหม่ (หรือได้แคชถ้าไฟล์เดิม)

## 4) Checklist

- [ ] Drive โฟลเดอร์แชร์เป็น "ทุกคนที่มีลิงก์"
- [ ] Google Cloud เปิด **Google Drive API**
- [ ] API health ok
- [ ] `VITE_API_BASE` ชี้ API จริง
- [ ] CORS อนุญาต origin เว็บ
- [ ] ลอง `/api/scene` ครั้งแรก (ช้าได้) แล้วครั้งสองเร็วขึ้น
