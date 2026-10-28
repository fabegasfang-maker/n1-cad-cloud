# N1 CAD Cloud (v2)

ระบบดูแผนผัง CAD แบบ **แปลงบนเซิร์ฟเวอร์** แล้วส่ง scene เบาไปวาดบนเบราว์เซอร์

**แยกจาก** repo เดิม [`-cad-n1-viewer`](https://github.com/fabegasfang-maker/-cad-n1-viewer) — ของเก่ายังใช้ได้คู่ขนาน

## เป้าหมาย

| ลูกค้า (เบราว์เซอร์) | เซิร์ฟเวอร์ |
|---------------------|-------------|
| โหลด scene JSON เบา | ดึง DWG จาก Google Drive |
| วาด canvas | แปลง DWG → geometry |
| ไม่รัน WASM แปลงไฟล์ใหญ่ | แคชตาม `fileId` + `modifiedTime` |

## โครงสร้าง

```
n1-cad-cloud/
├── apps/
│   ├── api/          # Node API (แปลง + Drive + แคช)
│   └── web/          # Vite + React viewer เบา
├── packages/
│   └── shared/       # ชนิดข้อมูล scene ร่วมกัน
└── README.md
```

## โฟลเดอร์ Drive เริ่มต้น

- Folder ID: `1mP47qarQZxPF-ln5Dy7VZrJlcq0uPJ4D`
- โครงสร้าง: โฟลเดอร์หลัก → โฟลเดอร์เดือน (เช่น `ตุลาคม 2569`) → ไฟล์ `.dwg` ล่าสุด

## API (ร่าง)

| Method | Path | คำอธิบาย |
|--------|------|----------|
| GET | `/api/health` | สถานะบริการ |
| GET | `/api/latest?folderId=` | metadata ไฟล์ CAD ล่าสุด |
| GET | `/api/scene?folderId=` | geometry พร้อมวาด (JSON) |
| GET | `/api/scene?folderId=&profile=mobile` | ฉบับย่อสำหรับมือถือ |
| GET | `/api/download?fileId=` | ดาวน์โหลด DWG ต้นฉบับ |

## เริ่มต้นพัฒนา

### API

```bash
cd apps/api
cp .env.example .env   # ใส่ GOOGLE_API_KEY / PORT
npm install
npm run dev
```

เปิด http://localhost:8787/api/health

### Web

```bash
cd apps/web
cp .env.example .env   # VITE_API_BASE=http://localhost:8787
npm install
npm run dev
```

## เฟสงาน

- [x] **เฟส 0** — โครง repo + health
- [ ] **เฟส 1** — Drive latest + แปลง DWG บนเซิร์ฟเวอร์ + แคช scene
- [ ] **เฟส 2** — เว็บโหลด `/api/scene` แล้ววาด
- [ ] **เฟส 3** — profile=mobile + ปุ่มดาวน์โหลด
- [ ] **เฟส 4** — คิวแปลง / monitor / deploy production

## โฮสต์

- **Web:** GitHub Pages / Cloudflare Pages / Vercel (static)
- **API:** Railway / Fly.io / VPS (ต้องมี RAM พอแปลง DWG — แนะนำ ≥1–2 GB)

> GitHub Pages โฮสต์ได้แค่ static เว็บ — API ต้องคนละที่

## License

Private/internal use สำหรับโครงการ N1 — ปรับตามนโยบายทีม
