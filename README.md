# N1 CAD Cloud (v2)

แปลง DWG **บนเซิร์ฟเวอร์** แล้วส่ง scene เบาไปวาดบนเบราว์เซอร์

แยกจาก [`-cad-n1-viewer`](https://github.com/fabegasfang-maker/-cad-n1-viewer)

## สถานะเฟส

- [x] **เฟส 0** — โครง repo + health
- [x] **เฟส 1** — Drive latest + แปลง + แคช scene
- [x] **เฟส 2** — เว็บวาด canvas
- [x] **เฟส 3** — มือถือ auto-profile / ดาวน์โหลด / pinch-zoom
- [x] **เฟส 4** — คิวแปลง + Docker/Railway + GitHub Pages workflow

## รัน local

```bash
# API
cd apps/api && cp .env.example .env   # GOOGLE_API_KEY=
npm install && npm run dev

# Web
cd apps/web && cp .env.example .env
npm install && npm run dev
```

## Production

ดูคู่มือเต็ม: **[DEPLOY.md](./DEPLOY.md)**

สรุปสั้นๆ:

1. Deploy `apps/api` บน Railway (Dockerfile) + ใส่ `GOOGLE_API_KEY`
2. ตั้ง GitHub Secret `VITE_API_BASE` = URL API
3. เปิด Pages จาก workflow `Deploy web to GitHub Pages`

## API

| Path | คำอธิบาย |
|------|----------|
| `/api/health` | สถานะ + คิว + แรม |
| `/api/latest` | DWG ล่าสุด |
| `/api/scene?profile=` | scene (คิวแปลงถ้า cache miss) |
| `/api/download` | ดาวน์โหลด DWG |

คิว: `CONVERT_CONCURRENCY` (default 1), `CONVERT_QUEUE_MAX` (default 8)
