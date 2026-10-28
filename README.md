# N1 CAD Cloud (v2)

ระบบดูแผนผัง CAD แบบ **แปลงบนเซิร์ฟเวอร์** แล้วส่ง scene เบาไปวาดบนเบราว์เซอร์

**แยกจาก** [`-cad-n1-viewer`](https://github.com/fabegasfang-maker/-cad-n1-viewer)

## สถานะเฟส

- [x] **เฟส 0** — โครง repo + health
- [x] **เฟส 1** — Drive latest + แปลง DWG บนเซิร์ฟเวอร์ + แคช scene
- [ ] **เฟส 2** — เว็บโหลด `/api/scene` แล้ววาด canvas
- [ ] **เฟส 3** — profile=mobile + UX ดาวน์โหลด
- [ ] **เฟส 4** — คิวแปลง / deploy production

## โครงสร้าง

```
apps/api/     Express + dwgdxf + Drive + cache
apps/web/     Vite React (เฟส 2 จะวาด scene)
packages/shared/
```

## API

| Method | Path | คำอธิบาย |
|--------|------|----------|
| GET | `/api/health` | สถานะ |
| GET | `/api/latest?folderId=` | metadata DWG ล่าสุด (เดือนล่าสุด → ไฟล์ล่าสุด) |
| GET | `/api/scene?folderId=&profile=desktop\|mobile` | scene JSON (แคชตาม fileId+modifiedTime) |
| GET | `/api/download?folderId=` หรือ `?fileId=` | ดาวน์โหลด DWG |

Default folder: `1mP47qarQZxPF-ln5Dy7VZrJlcq0uPJ4D`

## รัน API (เฟส 1)

```bash
cd apps/api
cp .env.example .env
# ใส่ GOOGLE_API_KEY=
npm install
npm run dev
```

ทดสอบ:

```bash
curl -s http://localhost:8787/api/health | jq
curl -s "http://localhost:8787/api/latest" | jq
# ครั้งแรกอาจใช้เวลานาน (ดาวน์โหลด + แปลง)
curl -s "http://localhost:8787/api/scene" -o scene.json
```

แคชอยู่ที่ `apps/api/cache/` — ครั้งถัดไปถ้าไฟล์บน Drive ไม่เปลี่ยนจะตอบเร็วขึ้น

## หมายเหตุการแปลง

- ใช้ `dwgdxf` บน Node (WASM) แปลง DWG → DXF แล้วสกัด LINE / LWPOLYLINE / CIRCLE / TEXT
- ยังไม่ครบทุก entity ของ AutoCAD — เฟส 1 เน้นแผนผังเส้น
- เครื่อง API ควรมี RAM ≥ 1–2 GB ตอนแปลงไฟล์ใหญ่

## License

Internal / โครงการ N1
